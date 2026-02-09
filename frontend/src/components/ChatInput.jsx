import React, { useState, useRef } from "react";
import { Send, Loader2, Settings2 } from "lucide-react";
import PropTypes from "prop-types";

const ChatInput = ({ onSend, isLoading, settings, onSettingsChange }) => {
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Settings Panel - Floating above input */}
        {showSettings && (
          <div className="mb-4 p-4 rounded-2xl glass-card animate-message-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Sources
                </label>
                <select
                  value={settings.numSources}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      numSources: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  {[3, 5, 7, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} sources
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detail Level
                </label>
                <select
                  value={settings.detailLevel}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      detailLevel: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="brief">Brief</option>
                  <option value="moderate">Moderate</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Floating Input Bar */}
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-center gap-2 p-2 rounded-2xl glass-card transition-all duration-300 ${
            input.trim() ? "shadow-lg ring-1 ring-primary-500/20" : "shadow-md"
          }`}
        >
          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              showSettings
                ? "bg-primary-100/80 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
            title="Settings"
          >
            <Settings2 className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent px-2 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none max-h-32 scrollbar-thin"
            disabled={isLoading}
            style={{ minHeight: "24px" }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-300 ${
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  settings: PropTypes.shape({
    numSources: PropTypes.number,
    detailLevel: PropTypes.string,
  }).isRequired,
  onSettingsChange: PropTypes.func.isRequired,
};

export default ChatInput;
