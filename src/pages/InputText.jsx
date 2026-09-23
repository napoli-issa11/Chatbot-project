import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// Retrieve API key using Vite's standard import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// System instructions to ground the AI with temporal awareness and a professional persona
const SYSTEM_INSTRUCTION =
  "You are an intelligent, articulate, and helpful AI assistant built for a developer's portfolio project. " +
  "Current Date: September 2026. You are fully temporally aware, accurate, and grounded in the year 2026. " +
  "Maintain a smart, polite, and professional persona with clear, well-structured, and insightful responses suitable for a developer's showcase.";

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
            "Configuration Error: Gemini API key is missing or not loaded. Please set VITE_GEMINI_API_KEY in your environment and restart the application.",
          sender: "robot",
          id: generateId(),
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const ai = getAiClient();
      const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.6-flash";
      const result = await ai.models.generateContent({
        model: model,
        contents: currentPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
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
      // Log the full technical error to the console for developer debugging
      console.error("Error generating response from Gemini API:", error);

      // Determine a clean, professional, user-friendly message for the UI
      const errorStr = `${error?.message || ""} ${typeof error === "object" ? JSON.stringify(error) : String(error)}`;
      const status = error?.status;

      let userFriendlyMessage =
        "I'm sorry, I encountered an issue processing your request. Please try again in a moment.";

      if (
        status === 503 ||
        errorStr.includes("503") ||
        errorStr.includes("UNAVAILABLE") ||
        errorStr.includes("high traffic") ||
        errorStr.includes("overloaded")
      ) {
        userFriendlyMessage =
          "The AI service is currently experiencing high traffic. Please try again in a moment.";
      } else if (
        status === 429 ||
        errorStr.includes("429") ||
        errorStr.includes("RESOURCE_EXHAUSTED") ||
        errorStr.includes("quota")
      ) {
        userFriendlyMessage =
          "The service is temporarily busy due to rate limits. Please wait a moment and try again.";
      } else if (
        status === 400 ||
        status === 403 ||
        errorStr.includes("API key not valid") ||
        errorStr.includes("API_KEY_INVALID")
      ) {
        userFriendlyMessage =
          "Unable to authenticate with the AI service. Please verify your API configuration.";
      } else if (
        status === 404 ||
        errorStr.includes("NOT_FOUND") ||
        errorStr.includes("is not found")
      ) {
        userFriendlyMessage =
          "The requested AI model is temporarily unavailable. Please try again shortly.";
      } else if (
        !navigator.onLine ||
        errorStr.includes("Failed to fetch") ||
        errorStr.includes("NetworkError")
      ) {
        userFriendlyMessage =
          "Unable to connect to the AI service. Please check your internet connection and try again.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          message: userFriendlyMessage,
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
