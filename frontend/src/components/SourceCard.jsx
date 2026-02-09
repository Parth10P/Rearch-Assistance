import React from "react";
import { ExternalLink } from "lucide-react";
import PropTypes from "prop-types";

const SourceCard = ({ source, index }) => {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-full bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-secondary-300 dark:hover:border-secondary-700 rounded-lg p-3 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 dark:bg-gray-700 text-xs font-semibold text-secondary-700 dark:text-primary-300">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
              {source.title}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          </div>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate mb-1.5">
            {new URL(source.url).hostname.replace("www.", "")}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {source.snippet}
          </p>
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
