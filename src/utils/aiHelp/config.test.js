import {
  DEFAULT_OLLAMA_MODEL,
  aiHelpAvailable,
  ollamaModel,
  ollamaUrl,
} from "./config";

const setSearch = (search) => {
  // jsdom allows replacing the whole location for this purpose.
  delete window.location;
  window.location = { search };
};

describe("aiHelp config", () => {
  const originalLocation = window.location;
  const originalUrl = process.env.REACT_APP_OLLAMA_URL;
  const originalModel = process.env.REACT_APP_OLLAMA_MODEL;

  beforeEach(() => {
    setSearch("");
    delete process.env.REACT_APP_OLLAMA_URL;
    delete process.env.REACT_APP_OLLAMA_MODEL;
  });

  afterEach(() => {
    window.location = originalLocation;
    process.env.REACT_APP_OLLAMA_URL = originalUrl;
    process.env.REACT_APP_OLLAMA_MODEL = originalModel;
  });

  describe("ollamaModel", () => {
    test("falls back to the default with nothing configured", () => {
      expect(ollamaModel()).toEqual(DEFAULT_OLLAMA_MODEL);
    });

    test("uses the env var when there is no URL parameter", () => {
      process.env.REACT_APP_OLLAMA_MODEL = "phi4-mini:latest";
      expect(ollamaModel()).toEqual("phi4-mini:latest");
    });

    test("lets a URL parameter win, so a tab can pin its own model", () => {
      process.env.REACT_APP_OLLAMA_MODEL = "phi4-mini:latest";
      setSearch("?ollama_model=qwen3.5:4b");
      expect(ollamaModel()).toEqual("qwen3.5:4b");
    });

    test.each([
      "gemma2:2b",
      "smollm2:360m",
      "library/foo:tag",
      "llama3.2:3b-instruct-q4_K_M",
    ])("accepts the real model name %s", (name) => {
      setSearch(`?ollama_model=${encodeURIComponent(name)}`);
      expect(ollamaModel()).toEqual(name);
    });

    test.each([
      ["a name with spaces", "not a model"],
      ["something quoted", '"gemma2:2b"'],
      ["an injected brace", "gemma2:2b}{"],
      ["an empty value", ""],
    ])("ignores %s and falls back", (_label, value) => {
      setSearch(`?ollama_model=${encodeURIComponent(value)}`);
      expect(ollamaModel()).toEqual(DEFAULT_OLLAMA_MODEL);
    });

    test("survives an unreadable location", () => {
      delete window.location;
      window.location = {
        get search() {
          throw new Error("no location");
        },
      };
      expect(ollamaModel()).toEqual(DEFAULT_OLLAMA_MODEL);
    });
  });

  describe("ollamaUrl", () => {
    test("is null with nothing configured, which hides the model rungs", () => {
      expect(ollamaUrl()).toBeNull();
      expect(aiHelpAvailable()).toBe(false);
    });

    test("uses the env var", () => {
      process.env.REACT_APP_OLLAMA_URL = "http://localhost:11434";
      expect(ollamaUrl()).toEqual("http://localhost:11434");
      expect(aiHelpAvailable()).toBe(true);
    });

    test.each([
      "http://localhost:11434",
      "http://127.0.0.1:11435",
      "http://localhost:3000",
    ])("accepts the loopback override %s", (url) => {
      setSearch(`?ollama_url=${encodeURIComponent(url)}`);
      expect(ollamaUrl()).toEqual(url);
    });

    test.each([
      ["another host", "http://evil.example.com:11434"],
      ["a bare host", "http://192.168.1.5:11434"],
      ["a hostname merely containing localhost", "http://localhost.evil.com"],
      ["a non-http scheme", "file:///etc/passwd"],
      ["nonsense", "not-a-url"],
    ])(
      "refuses %s, so a link cannot redirect the learner's code",
      (_l, url) => {
        process.env.REACT_APP_OLLAMA_URL = "http://localhost:11434";
        setSearch(`?ollama_url=${encodeURIComponent(url)}`);
        expect(ollamaUrl()).toEqual("http://localhost:11434");
      },
    );

    test("a refused override does not enable the feature on its own", () => {
      setSearch("?ollama_url=http%3A%2F%2Fevil.example.com");
      expect(aiHelpAvailable()).toBe(false);
    });
  });
});
