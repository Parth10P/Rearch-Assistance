import React, { useState } from "react";
import { Copy, Check, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import SourceCard from "./SourceCard";

const ChatMessage = ({ message, isUser }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-4 p-6 mb-4 rounded-3xl transition-all duration-300 ${
        isUser
          ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg ml-auto max-w-[85%]"
          : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm mr-auto max-w-[95%]"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
          isUser
            ? "bg-white/20 text-white backdrop-blur-sm"
            : "bg-gradient-to-br from-secondary-500 to-pink-600 text-white"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`font-semibold text-sm ${isUser ? "text-blue-50" : "text-gray-900 dark:text-white"}`}
          >
            {isUser ? "You" : "Research Assistant"}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all text-gray-400 dark:text-gray-400"
              title="Copy response"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Message text */}
        <div
          className={`prose max-w-none ${isUser ? "prose-invert text-white" : "dark:prose-invert"}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="leading-relaxed text-gray-800 dark:text-gray-200">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources (only for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full animate-pulse"></span>
              Sources Used
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} index={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {!isUser && message.metadata && (
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
            {message.metadata.processingTime && (
              <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                {message.metadata.processingTime.toFixed(2)}s
              </span>
            )}
            {message.metadata.model && (
              <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                {message.metadata.model}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    isUser: PropTypes.bool,
    sources: PropTypes.array,
    metadata: PropTypes.shape({
      processingTime: PropTypes.number,
      queriesUsed: PropTypes.array,
      model: PropTypes.string,
    }),
  }).isRequired,
  isUser: PropTypes.bool,
};

export default ChatMessage;
