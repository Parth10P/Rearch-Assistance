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
      className={`flex gap-4 p-6 animate-message-in ${
        isUser ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-purple-600"
            : "bg-gradient-to-br from-purple-500 to-pink-600"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {isUser ? "You" : "AI Research Assistant"}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
        <div className="prose dark:prose-invert max-w-none">
          {isUser ? (
            <p className="text-gray-800 dark:text-gray-200">
              {message.content}
            </p>
          ) : (
            <div className="text-gray-700 dark:text-gray-300">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources (only for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full"></span>
              Sources ({message.sources.length})
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
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {message.metadata.processingTime && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {message.metadata.processingTime.toFixed(2)}s
              </span>
            )}
            {message.metadata.queriesUsed && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {message.metadata.queriesUsed.length} queries
              </span>
            )}
            {message.metadata.model && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
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
