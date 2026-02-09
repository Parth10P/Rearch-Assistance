import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import PropTypes from "prop-types";

const SourceCard = ({ source, index }) => {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-full bg-white dark:bg-gray-800/80 hover:bg-primary-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 rounded-xl p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <ExternalLink className="w-12 h-12" />
      </div>

      <div className="flex items-start gap-3 relative z-10">
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {source.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
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
