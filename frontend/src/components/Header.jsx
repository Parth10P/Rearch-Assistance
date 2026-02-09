import React from "react";
import { Moon, Sun, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const Header = ({
  darkMode,
  onToggleDarkMode,
  onExportChat,
  onClearChat,
  messageCount,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-200/40 dark:border-gray-700/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Research Assistant Logo"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-secondary-800 dark:text-primary-200">
                Research Assistant
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </span>
                {messageCount > 0 && (
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                    {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {messageCount > 0 && (
              <button
                onClick={onExportChat}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-secondary-700 dark:hover:text-primary-300 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {messageCount > 0 && (
              <button
                onClick={onClearChat}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            {messageCount > 0 && (
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
            )}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-secondary-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
  onExportChat: PropTypes.func.isRequired,
  onClearChat: PropTypes.func.isRequired,
  messageCount: PropTypes.number.isRequired,
};

export default Header;
