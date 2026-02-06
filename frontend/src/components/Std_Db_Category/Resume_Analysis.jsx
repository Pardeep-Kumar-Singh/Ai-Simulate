import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Resume_Analysis = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animatedMatch, setAnimatedMatch] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      let res;

      if (jd.trim()) {
        formData.append("jd", jd);
        res = await axios.post(`${API_URL}/analyze`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${API_URL}/analyze-auto`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.error) {
        alert(res.data.error);
        setResult(null);
        return;
      }

      setResult(res.data);
      // NOTE: Previously saved to Firestore here.
      // If we want to save history, backend should handle it in the /analyze endpoint.

      setAnimatedMatch(0);
      setTimeout(() => setAnimatedMatch(res.data.match), 500);
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result?.match !== undefined) {
      let start = 0;
      const end = result.match;
      const duration = 1500;
      const increment = end / (duration / 20);

      let timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setAnimatedMatch(Math.round(start));
      }, 20);

      return () => clearInterval(timer);
    }
  }, [result]);

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-xl shadow-lg space-y-6 max-w-5xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">
        ATS Resume Analyzer
      </h2>

      {/* Upload Section */}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-sm text-gray-300 
                   file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg 
                   file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 
                   file:text-white hover:file:bg-indigo-700"
      />

      <textarea
        placeholder="Paste Job Description here (optional)..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        className="w-full p-2 sm:p-3 rounded-lg bg-slate-700 text-white text-sm sm:text-base"
        rows="5"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg shadow-md text-sm sm:text-base"
      >
        {loading ? "Analyzing..." : jd.trim() ? "Analyze with JD" : "Analyze Resume Only"}
      </button>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* ATS Score Circle (Responsive Loader) */}
          <div className="flex justify-center items-center">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle cx="80" cy="80" r="70" stroke="#374151" strokeWidth="10" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - animatedMatch / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-200 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                  {animatedMatch}%
                </span>
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          {result.match_keywords !== undefined && (
            <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-700">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Skills Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-green-400 font-semibold mb-3">Matched</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {result.match_keywords?.length > 0 ? (
                      result.match_keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-1.5 sm:px-5 sm:py-2 bg-slate-700 text-green-300 rounded-full text-xs sm:text-sm font-medium shadow hover:scale-105 transition"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No significant matches</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-red-400 font-semibold mb-3">Missing</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {result.missing_keywords?.length > 0 ? (
                      result.missing_keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-1.5 sm:px-5 sm:py-2 bg-slate-700 text-red-300 rounded-full text-xs sm:text-sm font-medium shadow hover:scale-105 transition"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No major keywords missing!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Summary */}
          <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-white">Profile Summary</h3>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">{result.summary}</p>
          </div>

          {/* Strengths & Weaknesses */}
          {result.strengths && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-800 p-3 sm:p-4 rounded-lg">
                <h3 className="text-green-400 font-semibold text-base sm:text-lg">Strengths</h3>
                <ul className="list-disc list-inside text-gray-300 mt-2 text-sm sm:text-base">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-800 p-3 sm:p-4 rounded-lg">
                <h3 className="text-red-400 font-semibold text-base sm:text-lg">Weaknesses</h3>
                <ul className="list-disc list-inside text-gray-300 mt-2 text-sm sm:text-base">
                  {result.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Resume_Analysis;
