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

      const technicalDetails =
        error?.message ||
        (typeof error === "object" ? JSON.stringify(error, null, 2) : String(error)) ||
        "Unknown error occurred";

      const statusInfo = error?.status ? `[Status ${error.status}] ` : "";
      const displayMessage = `Error: ${statusInfo}${technicalDetails}`;

      setChatMessages((prev) => [
        ...prev,
        {
          message: displayMessage,
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
