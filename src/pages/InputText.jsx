import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// console.log("API KEY CHECK :", import.meta.env.VITE_GEMINI_API_KEY)
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});
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
    setIsLoading(true);

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
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
      console.error("Error generating response:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          message: "Sorry, an error occurred while fetching the response. Please check your connection or API key.",
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
