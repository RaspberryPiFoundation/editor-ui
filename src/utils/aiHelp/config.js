// Config for the model-backed rungs of the error help ladder.
//
// Env vars, overridable per tab by URL parameter. The URL override exists
// because comparing models is the whole point of the prototype, and one model
// per server instance makes that tedious - with it you can open a tab per
// candidate against a single `ollama serve`:
//
//   /web-component.html?ollama_model=gemma2:2b
//   /web-component.html?ollama_model=qwen3.5:4b
//
// There is still no web component attribute for any of this: it should not
// become part of the host API until it has earned it. Vite's envPrefix is
// REACT_APP_ and the codebase reads process.env, so follow that rather than
// import.meta.env.
//
// These are functions, not constants, so that changing the environment or the
// URL in a test takes effect without re-importing the module.

export const DEFAULT_OLLAMA_MODEL = "llama3.2:3b";

// Ollama model names look like "qwen3.5:0.8b" or "library/foo:tag". Anything
// outside that is ignored rather than passed on, so a stray parameter cannot put
// arbitrary content into the request body.
const MODEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;

const urlParam = (name) => {
  try {
    return (
      new URLSearchParams(window.location.search).get(name)?.trim() || null
    );
  } catch {
    // No window, or an unparseable search string - fall back to the env var.
    return null;
  }
};

// A URL parameter can point the request at a different port, but only ever on
// this machine. Honouring an arbitrary origin here would turn a link into a way
// to post someone else's code to a server of the sender's choosing, which is not
// a trade worth making even in a prototype.
const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]", "::1"];

const loopbackOnly = (value) => {
  if (!value) {
    return null;
  }
  try {
    const { hostname, protocol } = new URL(value);
    const allowed =
      LOOPBACK_HOSTS.includes(hostname) &&
      (protocol === "http:" || protocol === "https:");
    return allowed ? value : null;
  } catch {
    return null;
  }
};

export const ollamaUrl = () =>
  loopbackOnly(urlParam("ollama_url")) ||
  process.env.REACT_APP_OLLAMA_URL ||
  null;

export const ollamaModel = () => {
  const fromUrl = urlParam("ollama_model");
  if (fromUrl && MODEL_PATTERN.test(fromUrl)) {
    return fromUrl;
  }
  return process.env.REACT_APP_OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
};

// With no URL configured there is nothing to call, so the model rungs are hidden
// entirely rather than offered and then failing. The pre-written rung does not
// depend on this.
export const aiHelpAvailable = () => Boolean(ollamaUrl());
