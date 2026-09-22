import { useEffect, useRef } from "react";
import { DisplayMessage } from "./DisplayMessage";

export function GenerateMessages({ chatMessages, isLoading }) {
  const containerElm = useRef(null);
  useEffect(() => {
    const container = containerElm.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);
  return (
    <div className="message-container" ref={containerElm}>
      {chatMessages.map((chatMessage, index) => {
        return (
          <DisplayMessage
            message={chatMessage.message}
            sender={chatMessage.sender}
            key={index}
          />
        );
      })}
      {isLoading && <div>loading...</div>}
    </div>
  );
}
