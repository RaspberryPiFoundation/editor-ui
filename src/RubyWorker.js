/* global globalThis */

const RUBY_WASM_HELPER_URL =
  "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@latest/dist/browser/+esm";

const RUBY_WASM_URL_CANDIDATES = [
  "https://cdn.jsdelivr.net/npm/@ruby/4.0-wasm-wasi@latest/dist/ruby+stdlib.wasm",
  "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@latest/dist/ruby+stdlib.wasm",
  "https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@latest/dist/ruby+stdlib.wasm",
];

let runtimePromise = null;
let runInProgress = false;

globalThis.__rubyWasmOut = (stream, chunk) => {
  postMessage({
    method: "handleOutput",
    stream,
    content: String(chunk ?? ""),
  });
};

// eslint-disable-next-line no-restricted-globals
addEventListener("message", async (event) => {
  const data = event.data || {};

  switch (data.method) {
    case "runRuby":
      await runRuby({ files: data.files, activeFile: data.activeFile });
      break;
    default:
      throw new Error(`Unsupported method: ${data.method}`);
  }
});

postMessage({ method: "handleLoaded" });

async function runRuby({ files = {}, activeFile = "main.rb" } = {}) {
  if (runInProgress) {
    postError("A Ruby run is already in progress.");
    return;
  }

  runInProgress = true;

  try {
    const vm = await initRubyRuntime();
    await syncProjectToApp(vm, files);
    await rubyEval(vm, buildRunScript(activeFile));
    postMessage({ method: "handleDone" });
  } catch (error) {
    postError(String(error?.message || error));
  } finally {
    runInProgress = false;
  }
}

function postError(message) {
  postMessage({
    method: "handleError",
    message,
  });
}

async function initRubyRuntime() {
  if (runtimePromise) {
    return runtimePromise;
  }

  runtimePromise = (async () => {
    const { DefaultRubyVM } = await import(RUBY_WASM_HELPER_URL);
    const wasmModule = await loadRubyWasmModule();
    const runtime = await DefaultRubyVM(wasmModule, { consolePrint: false });
    return runtime?.vm ?? runtime;
  })().catch((error) => {
    runtimePromise = null;
    throw error;
  });

  return runtimePromise;
}

async function loadRubyWasmModule() {
  const errors = [];

  for (const url of RUBY_WASM_URL_CANDIDATES) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        errors.push(`${url} -> HTTP ${response.status}`);
        continue;
      }

      if (typeof WebAssembly.compileStreaming === "function") {
        return await WebAssembly.compileStreaming(response);
      }

      const bytes = await response.arrayBuffer();
      return await WebAssembly.compile(bytes);
    } catch (error) {
      errors.push(`${url} -> ${String(error?.message || error)}`);
    }
  }

  throw new Error(
    `Could not load ruby.wasm from jsDelivr.\n${errors.join("\n")}`,
  );
}

async function rubyEval(vm, code) {
  if (typeof vm.evalAsync === "function") {
    return await vm.evalAsync(code);
  }

  return vm.eval(code);
}

async function syncProjectToApp(vm, files) {
  const lines = [
    "require 'fileutils'",
    "Dir.mkdir('/app') unless Dir.exist?('/app')",
  ];

  for (const [rawFileName, rawValue] of Object.entries(files || {})) {
    const fileName = normalizeFileName(rawFileName);
    if (!fileName) {
      continue;
    }

    const rubyFileName = escapeSingleQuotes(fileName);
    const b64 = encodeFileValue(rawValue);

    lines.push(`FileUtils.mkdir_p(File.dirname('/app/${rubyFileName}'))`);
    lines.push(`File.binwrite('/app/${rubyFileName}', '${b64}'.unpack1('m0'))`);
  }

  await rubyEval(vm, lines.join("\n"));
}

function buildRunScript(activeFileInput) {
  const activeFile = normalizeFileName(activeFileInput) || "main.rb";
  const rubyFile = escapeSingleQuotes(activeFile);

  return `
require "js"

class RPFJsStreamWriter
  def initialize(name)
    @name = name
  end

  def write(str)
    text = str.to_s
    sink = JS.global[:__rubyWasmOut]
    sink.call(@name, text) if sink.typeof == "function"
    text.bytesize
  end

  def <<(str)
    write(str)
    self
  end

  def flush
    self
  end

  def tty?
    false
  end

  def sync=(_value)
  end
end

original_stdout = $stdout
original_stderr = $stderr
$stdout = RPFJsStreamWriter.new("stdout")
$stderr = RPFJsStreamWriter.new("stderr")

begin
  $LOAD_PATH.unshift('/app') unless $LOAD_PATH.include?('/app')
  $LOADED_FEATURES.delete_if { |f| f.start_with?('/app/') }

  entry = '/app/${rubyFile}'
  value = TOPLEVEL_BINDING.eval(File.binread(entry), entry)
  $stdout.write("=> #{value.inspect}\\n")
rescue Exception => e
  $stderr.write("#{e.class}: #{e.message}\\n")
  bt = e.backtrace
  $stderr.write("#{bt.join("\\n")}\\n") if bt && !bt.empty?
ensure
  $stdout = original_stdout
  $stderr = original_stderr
end
`;
}

function encodeFileValue(value) {
  if (value && typeof value === "object" && value.encoding === "base64") {
    return String(value.content || "");
  }

  return toBase64Utf8(String(value ?? ""));
}

function normalizeFileName(input) {
  let name = String(input ?? "").trim();
  if (!name) {
    return null;
  }

  name = name.replace(/^\/+/, "");
  if (name.includes("..")) {
    return null;
  }

  if (!/^[A-Za-z0-9_./-]+$/.test(name)) {
    return null;
  }

  return name;
}

function escapeSingleQuotes(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\\\'");
}

function toBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}
