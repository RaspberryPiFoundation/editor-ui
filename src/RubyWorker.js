/* global globalThis */

const RUBY_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@ruby/4.0-wasm-wasi@latest/dist/ruby+stdlib.wasm";

let runtimePromise = null;
let runInProgress = false;
let runStage = "idle";

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
    const fileCount = Object.keys(files || {}).length;
    setRunStage("run:start", `activeFile=${activeFile}, files=${fileCount}`);

    setRunStage("runtime:init");
    const vm = await initRubyRuntime();

    setRunStage("filesystem:sync");
    await syncProjectToApp(vm, files);

    setRunStage("ruby:eval");
    await rubyEval(vm, buildRunScript(activeFile));

    setRunStage("run:done");
    postMessage({ method: "handleDone" });
  } catch (error) {
    postDebug(`Run failed at stage '${runStage}'`);
    if (error?.stack) {
      postDebug(error.stack);
    }
    postError(
      `Run failed at '${runStage}': ${String(error?.message || error)}`,
    );
  } finally {
    runInProgress = false;
    runStage = "idle";
  }
}

function setRunStage(stage, details = "") {
  runStage = stage;
  const suffix = details ? ` (${details})` : "";
  postDebug(`Stage: ${stage}${suffix}`);
}

function postDebug(message) {
  postMessage({
    method: "handleDebug",
    stage: runStage,
    message: String(message || ""),
  });
}

function postError(message) {
  postMessage({
    method: "handleError",
    message,
  });
}

async function initRubyRuntime() {
  if (runtimePromise) {
    postDebug("Using cached Ruby runtime");
    return runtimePromise;
  }

  runtimePromise = (async () => {
    postDebug("Importing @ruby/wasm-wasi helper module from jsDelivr");
    const { DefaultRubyVM } = await import(
      /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@latest/dist/browser/+esm"
    );

    postDebug("Loading Ruby WASM module");
    const wasmModule = await loadRubyWasmModule();

    postDebug("Creating Ruby VM");
    const runtime = await DefaultRubyVM(wasmModule, { consolePrint: false });
    postDebug("Ruby VM initialised");
    return runtime?.vm ?? runtime;
  })().catch((error) => {
    runtimePromise = null;
    throw error;
  });

  return runtimePromise;
}

async function loadRubyWasmModule() {
  postDebug(`Loading WASM: ${RUBY_WASM_URL}`);
  const response = await fetch(RUBY_WASM_URL);

  if (!response.ok) {
    throw new Error(
      `Could not load ruby.wasm from jsDelivr (${RUBY_WASM_URL}) -> HTTP ${response.status}`,
    );
  }

  if (typeof WebAssembly.compileStreaming === "function") {
    postDebug("Compiling WASM via compileStreaming");
    return await WebAssembly.compileStreaming(response);
  }

  const bytes = await response.arrayBuffer();
  postDebug("Compiling WASM from ArrayBuffer fallback");
  return await WebAssembly.compile(bytes);
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
    sink.apply(@name, text) if sink.typeof == "function"
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
