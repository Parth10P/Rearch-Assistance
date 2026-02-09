import React from "react";
import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 p-5 mb-4 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary-500 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
          <span
            className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Researching...
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
