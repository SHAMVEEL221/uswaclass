"use client";

import React from 'react'; // Add this import
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { 
  LogOut, Search, Filter, Download, File, Check, X, 
  Users, Upload, Shield, AlertCircle, Package, 
  Eye, EyeOff, DownloadCloud, Save, RefreshCw,
  BarChart3, UserCheck, UserX, Clock, Settings
} from "lucide-react";

export default function StudentFileAdmin() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [pendingResults, setPendingResults] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    uploaded: 0
  });

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      window.location.href = "/admin-login";
    }
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*");

      if (studentError) throw studentError;

      const { data: fileData, error: fileError } = await supabase
        .from("student_files")
        .select("*");

      // Continue even if no files yet
      if (fileError && fileError.code !== 'PGRST116') {
        console.log(fileError);
      }

      const mergedData = studentData.map(student => {
        const fileRecord = fileData?.find(file => file.username === student.username) || {};
        
        return {
          ...student,
          ...fileRecord,
          file1_url: fileRecord.file1_url || null,
          file2_url: fileRecord.file2_url || null,
          file3_url: fileRecord.file3_url || null,
          file4_url: fileRecord.file4_url || null,
          result: fileRecord.result || null
        };
      });

      setStudents(mergedData || []);
      
      const initialPending = {};
      mergedData.forEach(student => {
        initialPending[student.username] = student.result || "pending";
      });
      setPendingResults(initialPending);

      const classes = [...new Set(studentData.map(s => s.student_class))].sort();
      setUniqueClasses(classes);

      // Calculate stats
      calculateStats(mergedData);
    } catch (error) {
      console.error("Error loading students:", error);
      alert("Failed to load student data");
    } finally {
      setLoading(false);
    }
  }

  const calculateStats = (studentsData) => {
    const stats = {
      total: studentsData.length,
      approved: 0,
      rejected: 0,
      pending: 0,
      uploaded: 0
    };

    studentsData.forEach(student => {
      if (student.result === "approved") stats.approved++;
      else if (student.result === "rejected") stats.rejected++;
      else stats.pending++;

      const hasFiles = student.file1_url || student.file2_url || student.file3_url || student.file4_url;
      if (hasFiles) stats.uploaded++;
    });

    setStats(stats);
  };

  const setTemporaryResult = (username, status) => {
    setPendingResults(prev => ({
      ...prev,
      [username]: status
    }));
  };

  const publishResults = async () => {
    if (Object.keys(pendingResults).length === 0) {
      alert("No results to publish");
      return;
    }

    setIsPublishing(true);
    
    try {
      const updates = Object.entries(pendingResults).map(([username, result]) => ({
        username,
        result
      }));

      for (const update of updates) {
        const { data: existing } = await supabase
          .from("student_files")
          .select("*")
          .eq("username", update.username)
          .single();

        if (existing) {
          await supabase
            .from("student_files")
            .update({ result: update.result })
            .eq("username", update.username);
        } else {
          const student = students.find(s => s.username === update.username);
          if (student) {
            await supabase
              .from("student_files")
              .insert({
                username: update.username,
                student_name: student.student_name,
                result: update.result
              });
          }
        }
      }

      showNotification("Results published successfully!", "success");
      await loadStudents();
    } catch (error) {
      console.error("Error publishing results:", error);
      showNotification("Failed to publish results", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin-login";
  };

  const downloadSingleFile = async (fileUrl, student, fileNumber) => {
    if (!fileUrl) return;
    
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const originalName = fileUrl.split("/").pop();
      const fileName = `${student.username}-${student.student_name}-File${fileNumber}-${originalName}`;
      saveAs(blob, fileName);
      showNotification(`Downloaded File ${fileNumber}`, "success");
    } catch (error) {
      showNotification("Download failed", "error");
    }
  };

  const downloadZip = async (student) => {
    try {
      const zip = new JSZip();
      let fileCount = 0;

      for (let i = 1; i <= 4; i++) {
        const url = student[`file${i}_url`];
        if (!url) continue;

        const response = await fetch(url);
        const blob = await response.blob();
        const originalName = url.split("/").pop();
        zip.file(originalName, blob);
        fileCount++;
      }

      if (fileCount === 0) {
        showNotification("No files to download", "warning");
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${student.username}-${student.student_name}.zip`);
      showNotification(`Downloaded ${fileCount} files`, "success");
    } catch (error) {
      showNotification("Failed to create ZIP", "error");
    }
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 animate-slide-in ${
      type === "success" ? "bg-green-600" : 
      type === "error" ? "bg-red-600" : 
      type === "warning" ? "bg-yellow-600" : 
      "bg-blue-600"
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        ${type === "success" ? '✓' : type === "error" ? '✗' : type === "warning" ? '⚠' : 'ℹ️'}
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("animate-slide-out");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      stu.username?.toLowerCase().includes(search.toLowerCase());

    const matchesClass =
      classFilter === "" || stu.student_class === classFilter;

    return matchesSearch && matchesClass;
  });

  const hasUnsavedChanges = () => {
    return students.some(student => {
      const dbResult = student.result || "pending";
      const pendingResult = pendingResults[student.username] || "pending";
      return dbResult !== pendingResult;
    });
  };

  const unsavedCount = students.filter(student => {
    const dbResult = student.result || "pending";
    const pendingResult = pendingResults[student.username] || "pending";
    return dbResult !== pendingResult;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="relative bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-400">Student File Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
              <Users size={16} />
              <span>{stats.total} Students</span>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded-xl transition-all hover:scale-105"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-green-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserCheck size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-red-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <UserX size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-yellow-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-purple-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Upload size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Uploaded</p>
                <p className="text-2xl font-bold">{stats.uploaded}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadStudents}
                className="flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-lg transition-all"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Students</h2>
              <p className="text-gray-400 text-sm">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasUnsavedChanges() && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
                  <AlertCircle size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm">{unsavedCount} unsaved</span>
                </div>
              )}
              
              <button
                onClick={publishResults}
                disabled={!hasUnsavedChanges() || isPublishing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Publish Results
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table - Responsive */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-400">Loading student data...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No students found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-4 text-left text-gray-400 font-semibold">Student</th>
                    <th className="p-4 text-left text-gray-400 font-semibold hidden md:table-cell">Class</th>
                    <th className="p-4 text-left text-gray-400 font-semibold">Files</th>
                    <th className="p-4 text-left text-gray-400 font-semibold">Status</th>
                    <th className="p-4 text-left text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const pendingResult = pendingResults[student.username] || student.result || "pending";
                    const hasChanged = (student.result || "pending") !== pendingResult;
                    
                    return (
                      <React.Fragment key={student.username}>
                        {/* Main row */}
                        <tr className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-all ${hasChanged ? 'bg-gray-800/20' : ''}`}>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{student.student_name}</div>
                              <div className="text-sm text-gray-400">{student.username}</div>
                            </div>
                          </td>
                          
                          <td className="p-4 hidden md:table-cell">
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                              Class {student.student_class}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {[1, 2, 3, 4].map((num) => (
                                student[`file${num}_url`] ? (
                                  <button
                                    key={`${student.username}-file${num}`}
                                    onClick={() => downloadSingleFile(student[`file${num}_url`], student, num)}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 hover:bg-blue-800/30 border border-blue-800/30 rounded text-sm transition-all"
                                  >
                                    <File size={12} />
                                    File {num}
                                  </button>
                                ) : (
                                  <span key={`${student.username}-file${num}`} className="px-2 py-1 bg-gray-800/30 border border-gray-700/30 rounded text-sm text-gray-500">
                                    File {num}
                                  </span>
                                )
                              ))}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {hasChanged && (
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                pendingResult === "approved" 
                                  ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                                  : pendingResult === "rejected" 
                                  ? "bg-red-900/30 text-red-400 border border-red-800/50" 
                                  : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                              }`}>
                                {pendingResult.charAt(0).toUpperCase() + pendingResult.slice(1)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setTemporaryResult(student.username, "approved")}
                                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded ${
                                    pendingResult === "approved" 
                                      ? "bg-green-700 border border-green-500" 
                                      : "bg-green-600 hover:bg-green-700"
                                  }`}
                                >
                                  <Check size={16} />
                                  <span className="hidden sm:inline">Approve</span>
                                </button>

                                <button
                                  onClick={() => setTemporaryResult(student.username, "rejected")}
                                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded ${
                                    pendingResult === "rejected" 
                                      ? "bg-red-700 border border-red-500" 
                                      : "bg-red-600 hover:bg-red-700"
                                  }`}
                                >
                                  <X size={16} />
                                  <span className="hidden sm:inline">Reject</span>
                                </button>
                              </div>
                              
                              <button
                                onClick={() => downloadZip(student)}
                                disabled={!student.file1_url && !student.file2_url && !student.file3_url && !student.file4_url}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                              >
                                <Package size={16} />
                                <span className="hidden sm:inline">ZIP</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Mobile Expanded View - with unique key */}
                        <tr key={`${student.username}-mobile`} className="md:hidden border-b border-gray-800/50">
                          <td colSpan="5" className="p-4 bg-gray-900/30">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Class:</span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                                  Class {student.student_class}
                                </span>
                              </div>
                              
                              <div>
                                <span className="text-gray-400 block mb-2">Files Status:</span>
                                <div className="grid grid-cols-2 gap-2">
                                  {[1, 2, 3, 4].map((num) => (
                                    <div key={`${student.username}-status-${num}`} className="flex items-center justify-between">
                                      <span className="text-gray-300">File {num}:</span>
                                      <span className={student[`file${num}_url`] ? "text-green-400" : "text-gray-500"}>
                                        {student[`file${num}_url`] ? "✓ Uploaded" : "Not uploaded"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Unsaved Changes</p>
              <p className={`text-2xl font-bold ${unsavedCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {unsavedCount}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">Approval Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">Upload Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.total > 0 ? Math.round((stats.uploaded / stats.total) * 100) : 0}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">Completion</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${((stats.approved + stats.rejected) / stats.total) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Admin Dashboard • Secure Student Management System</p>
        <p className="mt-1">Logged in as Administrator</p>
      </footer>
    </div>
  );
}