import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// console.log("API KEY CHECK :", import.meta.env.VITE_GEMINI_API_KEY)
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});
export function InputText({ setChatMessages, setIsLoading }) {
  const [inputText, setInputText] = useState("");

  function ChangeInput(event) {
    setInputText(event.target.value);
  }
  async function SendButton() {
    const currentPrompt = inputText;
    setInputText("");

    const userSendingMessage = {
      message: currentPrompt,
      sender: "user",
      id: crypto.randomUUID(),
    };
    setChatMessages((prev) => [...prev, userSendingMessage]);
    setIsLoading(true);

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
        id: crypto.randomUUID(),
      },
    ]);
    setIsLoading(false);
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
