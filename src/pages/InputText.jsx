import { useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const primaryModel = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-3.8-flash";
const MODELS = [...new Set([primaryModel, "gemini-3.8-flash", "gemini-3.5-flash-lite"])];
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function InputText({ setChatMessages, setIsLoading }) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const prevIdRef = useRef(null);
  const activeModelRef = useRef(null);

  const addMessage = (message, sender) =>
    setChatMessages((prev) => [...prev, { message, sender, id: crypto.randomUUID() }]);

  async function SendButton() {
    const prompt = inputText.trim();
    if (!prompt || isSending) return;

    setInputText("");
    addMessage(prompt, "user");

    if (!ai) {
      addMessage("Missing VITE_GEMINI_API_KEY in .env file.", "robot");
      return;
    }

    setIsSending(true);
    setIsLoading(true);

    try {
      const models = activeModelRef.current
        ? [activeModelRef.current, ...MODELS.filter((m) => m !== activeModelRef.current)]
        : MODELS;

      let interaction;
      let usedModel;

      for (const model of models) {
        try {
          interaction = await ai.interactions.create({
            model,
            input: prompt,
            system_instruction:
              "You are a helpful, accurate AI assistant. Answer clearly and concisely in the user's language.",
            generation_config: { thinking_level: "low" },
            ...(activeModelRef.current === model && prevIdRef.current
              ? { previous_interaction_id: prevIdRef.current }
              : {}),
          });
          usedModel = model;
          break;
        } catch (err) {
          console.warn(`Model ${model} failed:`, err);
        }
      }

      const reply = interaction?.output_text?.trim();
      if (!reply) throw new Error("No response from Gemini API.");

      prevIdRef.current = interaction.id || null;
      activeModelRef.current = usedModel;
      addMessage(reply, "robot");
    } catch (error) {
      console.error("Gemini API error:", error);
      addMessage("Something went wrong. Please try again.", "robot");
    } finally {
      setIsSending(false);
      setIsLoading(false);
    }
  }

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isSending) SendButton();
          if (e.key === "Escape") setInputText("");
        }}
        className="input-text"
        placeholder="Ask me anything..."
        disabled={isSending}
      />
      <button onClick={SendButton} className="send-button" disabled={isSending}>
        Send
      </button>
    </div>
  );
}
