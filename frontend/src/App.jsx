import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import BackgroundParticles from "./components/BackgroundParticles";
import EmptyState from "./components/EmptyState";

import { researchAPI } from "./services/api";

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({
    numSources: 5,
    detailLevel: "moderate",
  });

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  // Send message
  const handleSendMessage = async (question) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      content: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await researchAPI.research(
        question,
        settings.numSources,
        settings.detailLevel,
      );

      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        content: response.answer,
        isUser: false,
        timestamp: new Date(),
        sources: response.sources || [],
        metadata: {
          processingTime: response.processing_time,
          queriesUsed: response.queries_used,
          model: response.model_used || "Google Gemini",
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      toast.success("Research completed!");
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        content: `❌ Sorry, I encountered an error: ${error.response?.data?.detail || error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        sources: [],
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  // Export chat
  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => {
        const role = msg.isUser ? "You" : "Assistant";
        const time = msg.timestamp.toLocaleString();
        let text = `[${time}] ${role}:\n${msg.content}\n`;

        if (!msg.isUser && msg.sources && msg.sources.length > 0) {
          text += "\nSources:\n";
          msg.sources.forEach((source, idx) => {
            text += `${idx + 1}. ${source.title}\n   ${source.url}\n`;
          });
        }

        return text;
      })
      .join("\n---\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Chat exported!");
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      toast.success("Chat cleared!");
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e0e0e0',
          },
        }}
      />

      {/* Animated Background */}
      <BackgroundParticles />

      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onExportChat={handleExportChat}
        onClearChat={handleClearChat}
        messageCount={messages.length}
      />

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {messages.length === 0 ? (
          /* Empty State - Centered */
          <EmptyState 
            onSuggestionClick={handleSendMessage}
            onSend={handleSendMessage}
            isLoading={isLoading}
            settings={settings}
            onSettingsChange={setSettings}
          />
        ) : (
          /* Chat Messages */
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              <div className="max-w-4xl mx-auto px-4 pb-32 pt-8">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ChatMessage message={message} isUser={message.isUser} />
                  </motion.div>
                ))}

                {isLoading && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              settings={settings}
              onSettingsChange={setSettings}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
