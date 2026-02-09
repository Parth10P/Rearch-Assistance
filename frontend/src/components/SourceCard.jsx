import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import PropTypes from "prop-types";

const SourceCard = ({ source, index }) => {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start gap-3">
        {/* Index badge */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{index}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {source.title}
            </h5>
            <ExternalLink className="flex-shrink-0 w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-colors" />
          </div>

          {source.snippet && (
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {source.snippet}
            </p>
          )}

          {/* URL preview */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
            <FileText className="w-3 h-3" />
            <span className="truncate">{new URL(source.url).hostname}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

SourceCard.propTypes = {
  source: PropTypes.shape({
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    snippet: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default SourceCard;
