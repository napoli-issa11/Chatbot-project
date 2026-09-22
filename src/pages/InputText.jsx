import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// Retrieve API key using Vite's standard import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Cache the GoogleGenAI client instance lazily once confirmed available
let aiClientInstance = null;

function getAiClient() {
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return aiClientInstance;
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function InputText({ setChatMessages, setIsLoading }) {
  const [inputText, setInputText] = useState("");

  function ChangeInput(event) {
    setInputText(event.target.value);
  }

  async function SendButton() {
    if (!inputText.trim()) return;

    const currentPrompt = inputText;
    setInputText("");

    const userSendingMessage = {
      message: currentPrompt,
      sender: "user",
      id: generateId(),
    };
    setChatMessages((prev) => [...prev, userSendingMessage]);

    // Validate that the Gemini API key is configured before attempting the request
    if (!apiKey || !apiKey.trim()) {
      console.error(
        "Missing Gemini API key: VITE_GEMINI_API_KEY is not defined or is empty in import.meta.env.\n" +
          "Ensure you have a .env file containing VITE_GEMINI_API_KEY=<your_api_key> and restart the Vite development server."
      );
      setChatMessages((prev) => [
        ...prev,
        {
          message:
            "Configuration Error: Gemini API key is missing or not loaded. Please set VITE_GEMINI_API_KEY in your .env file and restart the Vite development server.",
          sender: "robot",
          id: generateId(),
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const ai = getAiClient();
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: currentPrompt,
      });

      const response = result.text;
      setChatMessages((prev) => [
        ...prev,
        {
          message: response,
          sender: "robot",
          id: generateId(),
        },
      ]);
    } catch (error) {
      console.error("Error generating response from Gemini API:", error);

      let errorMessage =
        "Sorry, an error occurred while fetching the response. Please check your connection or try again.";

      const errorMsg = error?.message || "";
      if (
        errorMsg.includes("API key not valid") ||
        errorMsg.includes("API_KEY_INVALID") ||
        error?.status === 400 ||
        error?.status === 403
      ) {
        errorMessage =
          "Authentication Error: The provided Gemini API key is invalid. Please verify your VITE_GEMINI_API_KEY in the .env file.";
      } else if (
        error?.status === 429 ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("quota")
      ) {
        errorMessage =
          "Quota Exceeded: You have reached the Gemini API rate limit. Please wait a moment before trying again.";
      } else if (
        !navigator.onLine ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("NetworkError")
      ) {
        errorMessage =
          "Network Error: Unable to connect to the Gemini API. Please check your internet connection.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          message: errorMessage,
          sender: "robot",
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function pressKeyDown(event) {
    if (event.key === "Enter") {
      SendButton();
    }
    if (event.key === "Escape") {
      setInputText("");
    }
  }

  return (
    <div className="input-container">
      <input
        type="text"
        onChange={ChangeInput}
        value={inputText}
        className="input-text"
        onKeyDown={pressKeyDown}
      />
      <button onClick={SendButton} className="send-button">
        Send
      </button>
    </div>
  );
}
