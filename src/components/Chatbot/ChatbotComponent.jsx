import React, { useState, useEffect, useRef } from "react";
import { getEmbeddings, cosineSimilarity } from "../../utils/aiService";
import { SIMILARITY_THRESHOLD } from "../../utils/constants";
import "./Chatbot.css";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import KNOWLEDGE_BASE_DATA from "../../data/knowledgeBase.json";

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([
    { text: KNOWLEDGE_BASE_DATA.greeting?.response || "Hello!", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatMessagesRef = useRef(null);
  const [preparedKnowledgeBase, setPreparedKnowledgeBase] = useState({});
  const [isKnowledgeBaseLoading, setIsKnowledgeBaseLoading] = useState(true);
  const isOnline = useOnlineStatus();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const prepareKB = async () => {
      const newKB = JSON.parse(JSON.stringify(KNOWLEDGE_BASE_DATA));
      for (const intent in newKB) {
        const examples = newKB[intent].examples || [];
        if (examples.length > 0) {
          try {
            const embeddings = await Promise.all(
              examples.map((example) => getEmbeddings(example))
            );
            newKB[intent].exampleEmbeddings = embeddings;
          } catch (err) {
            console.error(`Error generating embeddings for ${intent}:`, err);
            newKB[intent].exampleEmbeddings = [];
          }
        } else {
          newKB[intent].exampleEmbeddings = [];
        }
      }
      setPreparedKnowledgeBase(newKB);
      setIsKnowledgeBaseLoading(false);
    };
    prepareKB();
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const getAIResponse = async (userMessageText) => {
    setLoading(true);
    if (!isOnline) {
      setLoading(false);
      return "It seems you're offline. Please check your internet connection.";
    }
    if (isKnowledgeBaseLoading) {
      setLoading(false);
      return "Please wait, I'm still getting ready...";
    }

    try {
      const userEmbedding = await getEmbeddings(userMessageText);
      let bestMatch = { intent: "default", score: 0 };

      for (const intent in preparedKnowledgeBase) {
        if (intent === "default") continue;
        const intentEmbeddings = preparedKnowledgeBase[intent].exampleEmbeddings || [];
        for (const exampleEmbedding of intentEmbeddings) {
          const score = cosineSimilarity(userEmbedding, exampleEmbedding);
          if (score > bestMatch.score) {
            bestMatch = { intent, score };
          }
        }
      }

      console.log(`Best match: ${bestMatch.intent} (${bestMatch.score})`);

      if (bestMatch.score >= SIMILARITY_THRESHOLD) {
        return preparedKnowledgeBase[bestMatch.intent].response;
      } else {
        return preparedKnowledgeBase.default?.response || "I'm not sure how to respond to that.";
      }
    } catch (error) {
      console.error("Error in getAIResponse:", error);
      if (error.message.includes("429")) {
        return "I'm experiencing high traffic. Please try again shortly.";
      }
      if (error.message.includes("403") || error.message.includes("401")) {
        return "There’s an issue with my setup. Please contact support.";
      }
      return preparedKnowledgeBase.default?.response || "Something went wrong.";
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    const userMessageText = inputValue;
    setMessages((prev) => [...prev, { text: userMessageText, sender: "user" }]);
    setInputValue("");

    if (!isOnline || isKnowledgeBaseLoading) {
      const fallback = !isOnline
        ? "You appear to be offline. Please check your internet connection."
        : "Please wait a moment, I'm initializing my knowledge...";
      setMessages((prev) => [...prev, { text: fallback, sender: "bot" }]);
      return;
    }

    const aiResponseText = await getAIResponse(userMessageText);
    setMessages((prev) => [...prev, { text: aiResponseText, sender: "bot" }]);
  };

  const handleInputChange = (e) => setInputValue(e.target.value);
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleSendMessage();
  };
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  return (
    <div className="chatbot-container">
      {!isChatOpen && (
        <button className="chatbot-open-button" onClick={toggleChat}>
          <img src="/images/operator.png" alt="Chat Icon" style={{ width: "100px" }} />
        </button>
      )}
      <div className={`chatbot-window ${isChatOpen ? "open" : "closed"}`}>
        {isChatOpen && (
          <>
            <div className="chatbot-header">
              <span role="img" aria-label="Chatbot icon">🤖</span>
              <h2>Educational Chatbot</h2>
              <button className="chatbot-close-button" onClick={toggleChat}>❌</button>
            </div>

            {isKnowledgeBaseLoading && (
              <div className="initial-loading-container">
                <div className="spinner"></div>
                <p className="initial-loading-message">Initializing knowledge base... Please wait.</p>
              </div>
            )}

            {!isOnline && (
              <p className="chatbot-message offline-message">🚫 You are currently offline.</p>
            )}

            <div className="chatbot-messages" ref={chatMessagesRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`message-row ${msg.sender}`}>
                  {msg.sender === "bot" && <div className="avatar bot-avatar">🤖</div>}
                  <p className={`${msg.sender}-message`}>{msg.text}</p>
                  {msg.sender === "user" && <div className="avatar user-avatar">👤</div>}
                </div>
              ))}
              {loading && (
                <div className="message-row bot">
                  <div className="avatar bot-avatar">🤖</div>
                  <p className="bot-message loading-indicator">Typing...</p>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                placeholder={
                  loading || isKnowledgeBaseLoading || !isOnline
                    ? "Waiting..."
                    : "Type your message..."
                }
                className="message-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={loading || isKnowledgeBaseLoading || !isOnline}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={loading || isKnowledgeBaseLoading || !isOnline}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotComponent;
