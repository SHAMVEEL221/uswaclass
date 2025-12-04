"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Eye, EyeOff, Search, Download, Filter, User, Key, GraduationCap, 
  FileText, LayoutDashboard, UserPlus, Users, Settings, LogOut, 
  Menu, X, ChevronRight, BookOpen, FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("students");
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("student_class", { ascending: true })
      .order("student_name", { ascending: true });

    if (!error) {
      setStudents(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  const handleSearchFilter = () => {
    let results = students;

    if (search.trim() !== "") {
      results = results.filter(
        (s) =>
          s.student_name.toLowerCase().includes(search.toLowerCase()) ||
          s.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (classFilter !== "All") {
      results = results.filter((s) => s.student_class === classFilter);
    }

    setFiltered(results);
  };

  const togglePassword = (username) => {
    setShowPassword((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navigateTo = (page) => {
    setActivePage(page);
    // You can add routing logic here based on your app structure
    console.log(`Navigating to ${page}`);
  };

  // Enhanced Excel styling function (keep existing)
  const applyExcelStyling = (ws, data) => {
    // ... (keep your existing applyExcelStyling function code)
  };

  const downloadExcel = (data, filename) => {
    // ... (keep your existing downloadExcel function code)
  };

  const downloadStudentData = (student) => {
    downloadExcel([student], `student_${student.username}`);
  };

  const downloadAllStudents = () => {
    if (filtered.length === 0) {
      alert("No Data to Download!");
      return;
    }
    downloadExcel(filtered, "all_students");
  };

  const downloadClassWise = () => {
    if (filtered.length === 0) {
      alert("No Data to Download!");
      return;
    }

    const groupedByClass = filtered.reduce((acc, student) => {
      const className = `Class ${student.student_class}`;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student);
      return acc;
    }, {});

    Object.entries(groupedByClass).forEach(([className, students]) => {
      downloadExcel(students, className.replace(/ /g, '_').toLowerCase());
    });
  };

  useEffect(() => {
    handleSearchFilter();
  }, [search, classFilter]);

  const uniqueClasses = [...new Set(students.map((s) => s.student_class))].sort();

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-student", label: "Add Student", icon: UserPlus },
    { id: "students", label: "Student Details", icon: Users },
    { id: "student-file", label: "Student File", icon: FileSpreadsheet },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white flex">
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800/50
      `}>
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                EduManage
              </h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${activePage === item.id 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-l-4 border-cyan-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {activePage === item.id && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-8 p-4 border-t border-gray-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
            >
              <div className="p-1.5 bg-red-500/20 rounded-lg group-hover:bg-red-500/30">
                <LogOut size={18} />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen">

        {/* Top Header */}
      <header className="bg-gradient-to-r from-gray-900/95 to-gray-950/95 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-800/50 lg:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold capitalize">
                  {activePage.replace('-', ' ')}
                </h2>
                <p className="text-sm text-gray-400">Manage your student data</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-4 md:p-8">
          {/* Page-specific content */}
          {activePage === "students" ? (
            <>
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                    <GraduationCap size={24} />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Student Management
                  </h1>
                </div>
                <p className="text-gray-400">Manage and export student information</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Students</p>
                      <p className="text-2xl font-bold text-white">{students.length}</p>
                    </div>
                    <User className="text-cyan-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Classes</p>
                      <p className="text-2xl font-bold text-white">{uniqueClasses.length}</p>
                    </div>
                    <GraduationCap className="text-blue-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Filtered</p>
                      <p className="text-2xl font-bold text-white">{filtered.length}</p>
                    </div>
                    <Filter className="text-green-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Download Options</p>
                      <p className="text-lg font-bold text-white">3 Formats</p>
                    </div>
                    <FileText className="text-purple-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Controls Section */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Search Box */}
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search by name or username..."
                        className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Class Filter */}
                  <div className="w-full lg:w-48">
                    <select
                      className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all appearance-none"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <option value="All">📚 All Classes</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          🎓 Class {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button
                      onClick={downloadAllStudents}
                      disabled={filtered.length === 0}
                      className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Download size={18} /> Export All
                    </button>
                    
                    <button
                      onClick={downloadClassWise}
                      disabled={filtered.length === 0}
                      className="flex-1 lg:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <FileText size={18} /> By Class
                    </button>
                  </div>
                </div>
              </div>

              {/* Student Table */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800 to-gray-900">
                        <th className="p-4 text-left font-semibold text-gray-300">S.No</th>
                        <th className="p-4 text-left font-semibold text-gray-300">Student Name</th>
                        <th className="p-4 text-left font-semibold text-gray-300">Class</th>
                        <th className="p-4 text-left font-semibold text-gray-300">Username</th>
                        <th className="p-4 text-left font-semibold text-gray-300">Password</th>
                        <th className="p-4 text-left font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-gray-400">Loading student data...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filtered.length > 0 ? (
                        filtered.map((student, index) => (
                          <tr
                            key={student.username}
                            className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${
                              index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-900/20"
                            }`}
                          >
                            <td className="p-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                                {index + 1}
                              </div>
                            </td>
                            <td className="p-4 font-medium">{student.student_name}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300 px-3 py-1 rounded-full text-sm">
                                <GraduationCap size={14} />
                                Class {student.student_class}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-gray-300">
                                <User size={16} />
                                {student.username}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Key size={16} className="text-gray-400" />
                                  <span className="font-mono">
                                    {showPassword[student.username]
                                      ? student.password
                                      : "••••••••"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => togglePassword(student.username)}
                                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                                  title={showPassword[student.username] ? "Hide password" : "Show password"}
                                >
                                  {showPassword[student.username] ? (
                                    <EyeOff size={16} className="text-gray-400 hover:text-white" />
                                  ) : (
                                    <Eye size={16} className="text-gray-400 hover:text-white" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => downloadStudentData(student)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
                              >
                                <Download size={16} />
                                Export
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                              <User size={48} />
                              <p className="text-lg">No students found</p>
                              <p className="text-sm">Try adjusting your search or filter</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activePage === "dashboard" && <LayoutDashboard size={32} className="text-cyan-400" />}
                  {activePage === "add-student" && <UserPlus size={32} className="text-green-400" />}
                  {activePage === "student-file" && <FileSpreadsheet size={32} className="text-purple-400" />}
                  {activePage === "settings" && <Settings size={32} className="text-yellow-400" />}
                </div>
                <h2 className="text-2xl font-bold mb-2 capitalize">
                  {activePage.replace('-', ' ')} Page
                </h2>
                <p className="text-gray-400">This page is under development</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}