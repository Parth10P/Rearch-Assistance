import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [numSources, setNumSources] = useState(5);
  const [detailLevel, setDetailLevel] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleResearch = async () => {
    if (question.length < 10) {
      alert("Please enter a question with at least 10 characters");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          num_sources: numSources,
          detail_level: detailLevel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.detail || "An error occurred");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleResearch();
    }
  };

  return (
    <div className="container">
      <h1> AI Research Assistant</h1>
      <p className="subtitle">
        Ask any question and get research-backed answers with citations
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., What are the environmental impacts of electric vehicles?"
        disabled={loading}
      />

      <div className="options">
        <div className="option-group">
          <label>Number of Sources</label>
          <input
            type="number"
            value={numSources}
            onChange={(e) => setNumSources(parseInt(e.target.value))}
            min="3"
            max="10"
            disabled={loading}
          />
        </div>
        <div className="option-group">
          <label>Detail Level</label>
          <select
            value={detailLevel}
            onChange={(e) => setDetailLevel(e.target.value)}
            disabled={loading}
          >
            <option value="brief">Brief</option>
            <option value="moderate">Moderate</option>
            <option value="comprehensive">Comprehensive</option>
          </select>
        </div>
      </div>

      <button onClick={handleResearch} disabled={loading || !question}>
        {loading ? "🔄 Researching..." : " Research"}
      </button>

      {loading && (
        <div className="loading-status">
          <p>Analyzing query and searching web...</p>
          <span className="loading-subtext">This may take 10-15 seconds</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result-container">
          <h2>Answer</h2>
          <div className="answer-content">
            {result.answer.split("\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3> Sources</h3>
            {result.sources.map((source, index) => (
              <div key={index} className="source-item">
                <span className="source-number">[{index + 1}]</span>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
              </div>
            ))}
          </div>

          <div className="meta-info">
             Processed in {result.processing_time.toFixed(2)}s |  Used{" "}
            {result.queries_used.length} search queries
          </div>
        </div>
      )}

      <div className="footer-links">
        <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
           API Documentation
        </a>
        <a href="http://127.0.0.1:8000/health" target="_blank" rel="noreferrer">
           Health Check
        </a>
      </div>
    </div>
  );
}

export default App;
