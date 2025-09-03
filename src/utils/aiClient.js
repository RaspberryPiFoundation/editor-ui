/**
 * List available Gemini models for the given API key.
 * @param {string} apiKey - Your Gemini API key
 * @returns {Promise<Object>} The response from the ListModels endpoint
 */
export async function listGeminiModels(apiKey) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(
      `ListModels failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}
// src/utils/aiClient.js

// Helper utility to connect to Gemini (Google AI) and send a request. Easily swappable for other models.
export async function sendGeminiRequest({
  prompt,
  apiKey,
  model = "gemini-2.5-pro",
  options = {},
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    ...options,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `AI request failed: ${response.status} ${response.statusText}`,
    );
  }
  const data = await response.json();
  return data;
}

// To switch models, just change the 'model' argument or the API URL logic above.
