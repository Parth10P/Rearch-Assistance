import React, { useState, useRef } from "react";
import { Send, Loader2, Settings2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

const ChatInput = ({ onSend, isLoading, settings, onSettingsChange, centered = false }) => {
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
    <div className={centered ? "" : "fixed bottom-0 left-0 right-0 z-50 pb-6 px-4 pt-8 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-900/90"}>
      <div className={centered ? "w-full" : "max-w-4xl mx-auto"}>
        {/* Settings Panel - Floating above input */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-secondary-600" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Settings
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {[3, 5, 7, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} sources
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="brief">Brief</option>
                    <option value="moderate">Moderate</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Input Bar */}
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-gray-800 border transition-all ${
            input.trim()
              ? "border-primary-400 shadow-lg"
              : "border-gray-300 dark:border-gray-700 shadow-md"
          }`}
        >
          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-lg transition-colors ${
              showSettings
                ? "bg-primary-100 dark:bg-gray-700 text-secondary-700 dark:text-primary-300"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
            className={`p-2.5 rounded-lg transition-all ${
              input.trim() && !isLoading
                ? "bg-secondary-500 hover:bg-secondary-600 text-white shadow-md"
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
  centered: PropTypes.bool,
};

export default ChatInput;
