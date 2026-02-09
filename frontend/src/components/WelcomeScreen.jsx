import React from "react";
import { Sparkles, TrendingUp, Globe, Lightbulb } from "lucide-react";
import PropTypes from "prop-types";

const WelcomeScreen = ({ onExampleClick }) => {
  const examples = [
    {
      icon: Globe,
      title: "Current Events",
      question: "What are the latest developments in artificial intelligence?",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Comparisons",
      question:
        "Compare the environmental impact of electric vehicles vs gas cars",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Lightbulb,
      title: "Explanations",
      question: "How does blockchain technology work in simple terms?",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Sparkles,
      title: "Research",
      question: "What are the benefits and risks of intermittent fasting?",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="max-w-4xl w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            AI Research Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ask me anything and I'll search the web, analyze multiple sources,
            and provide you with a comprehensive answer with citations.
          </p>
        </div>

        {/* Example Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {examples.map((example, idx) => {
            const Icon = example.icon;
            return (
              <button
                key={idx}
                onClick={() => onExampleClick(example.question)}
                className="group p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div
                  className={`inline-flex p-3 bg-gradient-to-br ${example.color} rounded-lg mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {example.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  "{example.question}"
                </p>
              </button>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Web Search
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Searches multiple sources for comprehensive information
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              AI Analysis
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Powered by Google Gemini for intelligent synthesis
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Cited Sources
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Every answer includes clickable source links
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

WelcomeScreen.propTypes = {
  onExampleClick: PropTypes.func.isRequired,
};

export default WelcomeScreen;
