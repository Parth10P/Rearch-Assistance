import React from "react";
import { Moon, Sun, Download, Trash2 } from "lucide-react";
import PropTypes from "prop-types";

const Header = ({
  darkMode,
  onToggleDarkMode,
  onExportChat,
  onClearChat,
  messageCount,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Research Assistant Logo"
              className="w-30 h-10 object-contain hover:scale-110 transition-transform duration-200"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Research Assistant
              </h1>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Online
                </span>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {messageCount} messages
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {messageCount > 0 && (
              <button
                onClick={onExportChat}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {messageCount > 0 && (
              <button
                onClick={onClearChat}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative overflow-hidden"
              title="Toggle Dark Mode"
            >
              <div className="relative z-10">
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </div>
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
