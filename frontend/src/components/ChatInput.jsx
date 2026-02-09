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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  onSettingsChange({ ...settings, detailLevel: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="brief">Brief</option>
                <option value="moderate">Moderate</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex-shrink-0 p-3 rounded-lg transition-colors ${
                showSettings
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Shift+Enter for new line)"
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-h-40"
                disabled={isLoading}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
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
