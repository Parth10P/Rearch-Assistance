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

  // Clean and normalize assistant content for display (strip raw trailing sources/notes and normalize bullets)
  const cleanContent = (content) => {
    if (!content) return "";

    let working = content;

    // Normalize CRLF
    working = working.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Remove trailing raw sources/notes blocks if they look like unformatted sources (contain URLs, [1], "AI synthesis", or "www.")
    const trailingKeywordRegex =
      /(sources|references|notes|note|sources and links)\b\s*[:-]?/i;
    const tm = working.match(trailingKeywordRegex);
    if (tm && tm.index !== undefined) {
      const lookAhead = working.substring(
        tm.index,
        Math.min(working.length, tm.index + 1200),
      );
      const looksLikeSources =
        /https?:\/\//i.test(lookAhead) ||
        /\[[0-9]+\]/.test(lookAhead) ||
        /ai synthesis/i.test(lookAhead) ||
        /www\./i.test(lookAhead);
      if (looksLikeSources) {
        working = working.substring(0, tm.index).trim();
      }
    }

    // Convert inline bullets (•) into markdown list items
    if (working.includes("•")) {
      working = working.replace(/\s*•\s*/g, "\n- ");
    }

    // Replace middle-dot separators with list entries
    working = working.replace(/\s*·{1,}\s*/g, "\n- ");

    return working.trim();
  };

  return (
    <div
      className={`group flex gap-4 p-5 mb-4 rounded-2xl transition-all duration-200 ${
        isUser
          ? "bg-primary-500 text-white shadow-sm ml-auto max-w-[85%]"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mr-auto max-w-[95%]"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isUser ? "bg-white/20 text-white" : "bg-secondary-500 text-white"
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
          className={`max-w-none break-words ${isUser ? "text-white" : "text-gray-800 dark:text-gray-200"}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {message.content}
            </p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{cleanContent(message.content)}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources (only for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Sources
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
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {message.metadata.processingTime && (
              <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                {message.metadata.processingTime.toFixed(2)}s
              </span>
            )}
            {message.metadata.model && (
              <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
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
