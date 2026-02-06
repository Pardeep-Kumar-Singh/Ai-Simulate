import React, { useEffect, useState, useContext } from "react";
import { Brain, BookOpen, FileText, ChevronRight, Play } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

import MaleIcon from "../../assets/male.png";
import FemaleIcon from "../../assets/female.png";

const formatDuration = (isoDuration) => {
  if (!isoDuration) return "N/A";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  const parts = [];
  if (hours) parts.push(hours.toString().padStart(2, "0"));
  parts.push(minutes.toString().padStart(2, "0"));
  parts.push(seconds.toString().padStart(2, "0"));
  return parts.join(":");
};

const MainDashboard = ({ setActiveItem }) => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    jobRole: "",
    contact: "",
    address: "",
    gender: "male",
    profileImage: "",
    skillsCount: 0,
  });

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [atsScoreData, setAtsScoreData] = useState({
    score: 0,
    lastUpdated: "N/A",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.uid) {
        try {
          const res = await axios.get(`${API_URL}/users/${user.uid}`);
          if (res.data) {
            const data = res.data;
            setProfileData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              jobRole: data.jobRole || "",
              contact: data.contact || "",
              address: data.address || "",
              gender: data.gender || "male",
              profileImage: data.profileImage || "",
              skillsCount: data.skills ? data.skills.length : 0,
            });

            const fields = [
              "firstName",
              "lastName",
              "jobRole",
              "contact",
              "address",
              "gender",
            ];
            const allFilled = fields.every(
              (field) => data[field] && data[field].toString().trim() !== ""
            );
            setProfileCompletion(allFilled ? 100 : 75);

            // Fetch ATS Score from backend profile
            setAtsScoreData({
              score: data.atsScore || 0,
              lastUpdated: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "Today"
            });
          }
        } catch (error) {
          console.error("Error fetching profile for dashboard:", error);
        }
      }
    };
    fetchProfile();
  }, [user, API_URL]);

  const getProfileImage = () =>
    profileData.profileImage
      ? profileData.profileImage
      : profileData.gender === "male"
        ? MaleIcon
        : FemaleIcon;

  // Fetch YouTube courses
  useEffect(() => {
    if (!profileData.jobRole) {
      setLoading(false);
      return;
    }

    const fetchYoutube = async () => {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_YT_API_KEY;
        const searchQuery = encodeURIComponent(
          profileData.jobRole + " tutorial"
        );

        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${searchQuery}&key=${apiKey}`
        );
        const searchData = await searchRes.json();

        if (searchData.items) {
          const videoIds = searchData.items
            .map((item) => item.id.videoId)
            .join(",");
          const videoRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
          );
          const videoData = await videoRes.json();

          const ytCourses = searchData.items.map((item, index) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            instructor: item.snippet.channelTitle,
            duration: formatDuration(
              videoData.items[index]?.contentDetails?.duration
            ),
            link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          }));

          setCourses(ytCourses);
        }
      } catch (err) {
        console.error("Error fetching YouTube videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchYoutube();
  }, [profileData.jobRole]);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header & Profile Info */}
      <div className="mb-6 sm:mb-8 bg-slate-800/60 rounded-xl p-4 sm:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
              <img
                src={getProfileImage()}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Welcome back, {profileData.firstName} {profileData.lastName}!
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                {profileData.jobRole}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right">
            <div className="text-xs sm:text-sm text-slate-400 mb-1">
              Profile Completion
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 sm:flex-none w-full sm:w-20 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">
                {profileCompletion}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Skills */}
        <div className="bg-gradient-to-br from-blue-700/40 to-blue-900/40 rounded-xl p-4 sm:p-6 border border-blue-700/30 hover:shadow-blue-400/20 shadow-md hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-xs sm:text-sm">Total Skills</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {profileData.skillsCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/30 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-400 text-xs sm:text-sm">
              {profileData.skillsCount || 0} Technical Skills
            </span>
          </div>
        </div>

        {/* ATS Score */}
        <div className="bg-gradient-to-br from-green-700/40 to-green-900/40 rounded-xl p-4 sm:p-6 border border-green-700/30 hover:shadow-green-400/20 shadow-md hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-xs sm:text-sm">ATS Score</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {atsScoreData.score}%
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-yellow-400 text-xs sm:text-sm">
              Last updated: {atsScoreData.lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-8">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />{" "}
              Recommended Courses
            </h3>
            <button
              onClick={() => setActiveItem("Course Suggest")}
              className="text-purple-400 text-xs sm:text-sm hover:text-purple-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg h-40 sm:h-48"></div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-700/40 rounded-lg overflow-hidden hover:bg-slate-600/40 transition-transform transform hover:scale-105 cursor-pointer group"
                  onClick={() => setActiveVideo(course)}
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-28 sm:h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-[10px] sm:text-xs">
                      {course.duration}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h4 className="text-white font-medium text-xs sm:text-sm mb-1 line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-slate-400 text-sm sm:text-xs">
                      {course.instructor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No courses available yet.</p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-900 rounded-lg overflow-hidden w-full max-w-md sm:max-w-2xl md:max-w-3xl relative">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-2 right-2 text-white text-lg sm:text-xl font-bold z-50"
            >
              ✕
            </button>
            <iframe
              className="w-full h-56 sm:h-72 md:h-96"
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
              title={activeVideo.title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
            <div className="p-3 sm:p-4">
              <h3 className="text-white font-semibold text-sm sm:text-base">
                {activeVideo.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                {activeVideo.instructor}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
