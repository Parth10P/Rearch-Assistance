import React from "react";
import { TrendingUp, BookOpen, Lightbulb, Globe } from "lucide-react";
import PropTypes from "prop-types";
import ChatInput from "./ChatInput";

const EmptyState = ({ onSuggestionClick, onSend, isLoading, settings, onSettingsChange }) => {
  const suggestions = [
    {
      icon: TrendingUp,
      text: "What are the latest trends in artificial intelligence?",
      category: "Technology",
    },
    {
      icon: BookOpen,
      text: "Explain quantum computing in simple terms",
      category: "Science",
    },
    {
      icon: Lightbulb,
      text: "How does climate change affect global economies?",
      category: "Environment",
    },
    {
      icon: Globe,
      text: "What is the history of the Internet?",
      category: "History",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Research Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
            Ask me anything and I'll search the web to provide you with
            well-researched, comprehensive answers backed by reliable sources.
          </p>

          {/* Chat Input - Centered */}
          <div className="relative z-50">
            <ChatInput
              onSend={onSend}
              isLoading={isLoading}
              settings={settings}
              onSettingsChange={onSettingsChange}
              centered={true}
            />
          </div>
        </div>

        {/* Suggestion Cards - Below Input */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Try asking about
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className="group relative text-left p-4 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-600 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-secondary-100 dark:group-hover:bg-secondary-900/30 transition-colors">
                      <Icon className="w-5 h-5 text-secondary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-secondary-600 dark:text-primary-400 mb-1 block">
                        {suggestion.category}
                      </span>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        {suggestion.text}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  onSuggestionClick: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  settings: PropTypes.shape({
    numSources: PropTypes.number,
    detailLevel: PropTypes.string,
  }).isRequired,
  onSettingsChange: PropTypes.func.isRequired,
};

export default EmptyState;
