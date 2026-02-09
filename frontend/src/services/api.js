import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const researchAPI = {
  // Send research question
  research: async (question, numSources = 5, detailLevel = "moderate") => {
    const response = await api.post("/research", {
      question,
      num_sources: numSources,
      detail_level: detailLevel,
    });
    return response.data;
  },

  // Get chat history
  getHistory: async (limit = 10) => {
    const response = await api.get(`/history?limit=${limit}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async () => {
    const response = await api.get("/analytics");
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
