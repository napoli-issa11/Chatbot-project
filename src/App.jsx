import { useState } from "react";
import { InputText } from "./pages/InputText";
import { GenerateMessages } from "./pages/GenerateMessages";
import "./App.css";

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="app-container">
      <InputText
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        setIsLoading={setIsLoading}
      />

      <GenerateMessages chatMessages={chatMessages} isLoading={isLoading} />
    </div>
  );
}

export default App;
