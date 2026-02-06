import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Search, Play, X, Clock } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const CourseSuggestions = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  const API_KEY = import.meta.env.VITE_YT_API_KEY;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || "").replace("H", "") || 0;
    const minutes = (match[2] || "").replace("M", "") || 0;
    const seconds = (match[3] || "").replace("S", "") || 0;
    return `${hours > 0 ? hours + ":" : ""}${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const fetchSkillsFromAI = async (role) => {
    try {
      // Call backend instead of direct Gemini SDK
      const res = await axios.post(`${API_URL}/suggest-skills`, { role });
      const skills = res.data;

      setSuggestedSkills(
        Array.isArray(skills) && skills.length > 0 ? skills : ["React", "JavaScript", "Node.js"]
      );
    } catch (error) {
      console.error("AI Skill Fetch error:", error);
      setSuggestedSkills(["React", "JavaScript", "Node.js"]);
    }
  };

  const fetchVideos = useCallback(
    async (query, pageToken = "") => {
      try {
        setLoading(true);
        const searchRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              q: query,
              key: API_KEY,
              maxResults: 9,
              type: "video",
              pageToken,
            },
          }
        );

        const videoIds = searchRes.data.items.map((i) => i.id.videoId);
        if (!videoIds.length) {
          setVideos([]);
          return;
        }

        const detailsRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/videos",
          {
            params: {
              part: "contentDetails,snippet",
              id: videoIds.join(","),
              key: API_KEY,
            },
          }
        );

        const videoData = detailsRes.data.items.map((item) => ({
          id: item.id,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high.url,
          duration: formatDuration(item.contentDetails.duration),
        }));

        setVideos(videoData);
        setNextPageToken(searchRes.data.nextPageToken || null);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    },
    [API_KEY]
  );

  useEffect(() => {
    const fetchUserJobRole = async () => {
      setSuggestedSkills(["React", "JavaScript", "Node.js"]);

      if (user && user.uid) {
        try {
          // Fetch user details from backend to get jobRole
          const res = await axios.get(`${API_URL}/users/${user.uid}`);
          if (res.data) {
            const role = res.data.jobRole || "";
            setJobRole(role);

            if (role) {
              await fetchSkillsFromAI(role);
              await fetchVideos(role + " tutorials");
            } else {
              await fetchVideos("React tutorials");
            }
          } else {
            await fetchVideos("React tutorials");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          await fetchVideos("React tutorials");
        }
      } else {
        await fetchVideos("React tutorials");
      }
    };

    fetchUserJobRole();
  }, [user, API_URL, fetchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) fetchVideos(searchTerm);
  };

  const handleTagClick = (skill) => fetchVideos(skill + " tutorials");

  return (
    <div className="bg-transparent p-4 sm:p-6">
      {/* Search Bar */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search courses... ${jobRole ? `(Suggested: ${jobRole})` : ""
                }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:py-3 rounded-lg transition-colors w-full sm:w-auto"
          >
            Search
          </button>
        </form>

        {/* AI-Suggested Skill Tags */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
          {suggestedSkills.length > 0 ? (
            suggestedSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleTagClick(skill)}
                className="bg-slate-700 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-full transition-colors"
              >
                {skill}
              </button>
            ))
          ) : (
            <p className="text-slate-400 text-center sm:text-left">
              Fetching skill suggestions...
            </p>
          )}
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="text-center text-slate-400">Loading...</div>
      ) : videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/70 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedVideo(video.id)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-44 sm:h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-white text-base sm:text-lg mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{video.channel}</p>
                </div>
              </div>
            ))}
          </div>

          {nextPageToken && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() =>
                  fetchVideos(
                    searchTerm || jobRole || "React tutorials",
                    nextPageToken
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 sm:py-3 rounded-lg transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-white mb-2">
            Search for courses
          </h3>
          <p className="text-slate-400">
            Enter a keyword or click on a suggested skill tag
          </p>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-black rounded-xl overflow-hidden w-full max-w-4xl">
            <button
              className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-b-xl"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSuggestions;
