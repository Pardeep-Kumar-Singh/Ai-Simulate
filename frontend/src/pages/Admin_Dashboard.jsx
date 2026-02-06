import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Download,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  BarChart3,
  GraduationCap,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  LogOut,
  Bell,
  Settings,
  Menu,
} from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [students, setStudents] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Fetch users from MySQL backend (which is actually MongoDB now)
        const usersResponse = await axios.get(`${API_URL}/users`);
        const usersData = usersResponse.data;

        const studentList = usersData.map((user) => {
          let regDate = new Date();
          if (user.timestamp) {
            regDate = new Date(user.timestamp);
          }

          return {
            id: user.id || user._id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.contact || "N/A",
            address: user.address || "—",
            jobRole: user.jobRole || "Not set",
            atsScore: user.atsScore || 0,
            status: user.status || "active",
            resumeUploaded: (user.atsScore && user.atsScore > 0) ? true : false,
            registrationDate: regDate.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
          };
        });

        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudents();
  }, [API_URL]);

  const stats = useMemo(
    () => ({
      total: students.length,
      active: students.filter((s) => s.status === "active").length,
      withResume: students.filter((s) => s.resumeUploaded).length,
      avgAtsScore:
        students.filter((s) => s.atsScore > 0).length > 0
          ? Math.round(
            students.reduce((sum, s) => sum + (s.atsScore || 0), 0) /
            students.filter((s) => s.atsScore > 0).length
          )
          : 0,
    }),
    [students]
  );

  const filteredStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        `${student.firstName} ${student.lastName} ${student.email} ${student.jobRole}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || student.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case "atsScore":
          aValue = a.atsScore;
          bValue = b.atsScore;
          break;
        case "date":
          aValue = new Date(a.registrationDate);
          bValue = new Date(b.registrationDate);
          break;
        default:
          return 0;
      }
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });

    return filtered;
  }, [students, searchTerm, filterStatus, sortBy, sortOrder]);

  const downloadCSV = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Job Role",
      "ATS Score",
      "Status",
      "Registration Date",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student) =>
        [
          student.id,
          student.firstName,
          student.lastName,
          student.email,
          student.phone,
          student.jobRole,
          student.atsScore,
          student.status,
          student.registrationDate,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify(filteredStudents, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_data.json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    if (status === "active") {
      return `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200`;
    }
    return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
  };

  const getAtsScoreColor = (score) => {
    if (score >= 85) return "text-emerald-600 font-semibold";
    if (score >= 70) return "text-amber-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const handleDeleteStudent = async (studentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this student?"
      )
    )
      return;

    try {
      await axios.delete(`${API_URL}/users/${studentId}`);

      // Update UI instantly
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">

              <div className="flex items-center space-x-3 ml-4 md:ml-0">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    AI SIMULATE
                  </h1>
                  <p className="text-xs text-gray-500">Student Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Admin Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>

              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm("Are you sure you want to logout?")) {
                    localStorage.removeItem('user');
                    window.location.href = "/login";
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Student Management Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor and manage all student registrations and data with powerful
            analytics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +12% from last month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">With Resume</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {stats.withResume}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +15% from last month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg ATS Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.avgAtsScore}%
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +5% from last month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="name">Sort by Name</option>
                  <option value="atsScore">Sort by ATS Score</option>
                  <option value="date">Sort by Date</option>
                </select>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"
                    }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Download Actions */}
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={downloadJSON}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">
                  {selectedStudents.length} student(s) selected
                </span>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm rounded-lg transition-all duration-200 transform hover:-translate-y-0.5">
                    Export Selected
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm rounded-lg transition-all duration-200 transform hover:-translate-y-0.5">
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80">
                <tr>
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.length === filteredStudents.length &&
                        filteredStudents.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded-lg w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Job Role
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ATS Score
                  </th>

                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">

                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded-lg w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-semibold text-sm">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-900 font-medium">
                        {student.phone}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {student.address}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        {student.jobRole}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div
                          className={`text-lg font-bold ${getAtsScoreColor(
                            student.atsScore
                          )}`}
                        >
                          {student.atsScore}%
                        </div>
                        {!student.resumeUploaded && (
                          <AlertCircle
                            className="w-5 h-5 text-amber-500 ml-2"
                            title="No resume uploaded"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={getStatusBadge(student.status)}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">
                      {new Date(student.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No students found matching your criteria
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Results Footer */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-600 bg-white/50 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/40">
          <div className="font-medium">
            Showing{" "}
            <span className="text-indigo-600 font-semibold">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="text-indigo-600 font-semibold">
              {students.length}
            </span>{" "}
            students
          </div>
          <div className="flex items-center gap-6">
            <span className="font-medium">Students per page: 50</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-all transform hover:-translate-y-0.5">
                Previous
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-lg">
                1
              </button>
              <button className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-all transform hover:-translate-y-0.5">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
