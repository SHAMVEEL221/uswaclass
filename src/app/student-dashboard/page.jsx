"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { 
  LogOut, Upload, Home, Clock, CheckCircle, XCircle, 
  User, BookOpen, FileText, AlertCircle, Shield, 
  ChevronRight, CloudUpload, RefreshCw, Download
} from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [uploadStatus, setUploadStatus] = useState([false, false, false, false]);
  const [files, setFiles] = useState([null, null, null, null]);
  const [selectedFiles, setSelectedFiles] = useState([null, null, null, null]);
  const [resultStatus, setResultStatus] = useState("pending");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load student + fetch uploaded files + result
  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    if (!storedStudent) {
      window.location.href = "/login";
      return;
    }

    const stu = JSON.parse(storedStudent);
    setStudent(stu);

    async function loadFiles() {
      const { data } = await supabase
        .from("student_files")
        .select("*")
        .eq("username", stu.username)
        .maybeSingle();

      if (data) {
        const loadedFiles = [
          data.file1_url,
          data.file2_url,
          data.file3_url,
          data.file4_url,
        ];

        setFiles(loadedFiles);
        setUploadStatus(loadedFiles.map(f => Boolean(f)));
        
        // Set result status
        if (data.result) {
          setResultStatus(data.result);
        }
      }
    }

    loadFiles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("student");
    window.location.href = "/login";
  };

  const handleFileChange = (index, file) => {
  if (!file) return;

  const allowed = {
    0: ["ai"],            // File 1 → Illustrator
    1: ["doc", "docx"],   // File 2 → Word
    2: ["ai"],            // File 3 → Illustrator
    3: ["html", "css", "js","zip"], // File 4 → Only index/html/css/js
  };

  const ext = file.name.split(".").pop().toLowerCase();

  if (!allowed[index].includes(ext)) {
    alert(`Invalid file type!  
File ${index + 1} accepts only: ${allowed[index].join(", ")}`);
    return;
  }

  const updated = [...selectedFiles];
  updated[index] = file;
  setSelectedFiles(updated);

  const fileNameElement = document.getElementById(`file-name-${index}`);
  if (fileNameElement) {
    fileNameElement.textContent =
      file.name.length > 30 ? file.name.substring(0, 30) + "..." : file.name;
  }
};


  const handleUpload = async () => {
    if (!selectedFiles.some(Boolean)) {
      alert("Please select at least one file");
      return;
    }

    setUploading(true);
    let completed = 0;
    const totalFiles = selectedFiles.filter(Boolean).length;

    // Ensure row exists
    const { data: existing } = await supabase
      .from("student_files")
      .select("*")
      .eq("username", student.username)
      .maybeSingle();

    if (!existing) {
      await supabase.from("student_files").insert({
        username: student.username,
        student_name: student.student_name,
        file1_url: null,
        file2_url: null,
        file3_url: null,
        file4_url: null,
        result: "pending"
      });
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      if (!selectedFiles[i]) continue;

      const file = selectedFiles[i];
      const filePath = `student-uploads/${student.username}/file${i + 1}-${Date.now()}-${file.name}`;

      // Update progress
      setUploadProgress(Math.round((completed / totalFiles) * 100));

      const { error: uploadError } = await supabase.storage
        .from("albayan")
        .upload(filePath, file);

      if (uploadError) {
        console.log(uploadError);
        alert(`Upload failed for file ${i + 1}: ${uploadError.message}`);
        continue;
      }

      const publicUrl = supabase.storage
        .from("albayan")
        .getPublicUrl(filePath).data.publicUrl;

      await supabase
        .from("student_files")
        .update({
          [`file${i + 1}_url`]: publicUrl,
        })
        .eq("username", student.username);

      // Mark success
      setUploadStatus(prev => {
        const updated = [...prev];
        updated[i] = true;
        return updated;
      });

      completed++;
      setUploadProgress(Math.round((completed / totalFiles) * 100));
    }

    // Reset result to pending when new files are uploaded
    await supabase
      .from("student_files")
      .update({ result: "pending" })
      .eq("username", student.username);
    
    setResultStatus("pending");
    setUploading(false);
    setUploadProgress(0);
    setSelectedFiles([null, null, null, null]);
    
    // Clear file name previews
    [0,1,2,3].forEach(i => {
      const element = document.getElementById(`file-name-${i}`);
      if (element) element.textContent = '';
    });

    // Show success notification
    showNotification("Files uploaded successfully!", "success");
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 animate-slide-in ${
      type === "success" ? "bg-green-600" : 
      type === "error" ? "bg-red-600" : 
      "bg-blue-600"
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        ${type === "success" ? '✓' : type === "error" ? '✗' : 'ℹ️'}
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("animate-slide-out");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  if (!student) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  const renderResultStatus = () => {
    const config = {
      approved: {
        icon: CheckCircle,
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/30",
        label: "Approved",
        message: "Congratulations! Your submission has been approved."
      },
      rejected: {
        icon: XCircle,
        color: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/30",
        label: "Rejected",
        message: "Your submission has been rejected. Please contact your admin for details."
      },
      pending: {
        icon: Clock,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/30",
        label: "Pending Review",
        message: "Your files are under review. The admin will update your status soon."
      }
    };

    const status = config[resultStatus] || config.pending;
    const Icon = status.icon;

    return (
      <div className={`p-6 rounded-2xl border ${status.border} ${status.bg} backdrop-blur-sm`}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icon size={28} className={status.color} />
          <span className={`text-xl font-bold ${status.color}`}>{status.label}</span>
        </div>
        <p className="text-gray-300 text-center">{status.message}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="relative bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">
              <Home size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Student Portal
              </h1>
              <p className="text-sm text-gray-400">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
              <Shield size={16} />
              <span>Secure Session</span>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded-xl transition-all hover:scale-105"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome back, {student.student_name.split(' ')[0]}!</h2>
                <p className="text-gray-400">Here's your submission dashboard</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400">Class</p>
                <p className="text-lg font-semibold text-cyan-400">{student.student_class}</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400">Uploaded</p>
                <p className="text-lg font-semibold text-cyan-400">{uploadStatus.filter(Boolean).length}/4</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400">ID</p>
                <p className="text-lg font-semibold text-cyan-400 truncate">{student.username}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Card */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Submission Status</h3>
            </div>
            {renderResultStatus()}
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-lg font-semibold mb-4">Upload Progress</h4>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-gray-400" />
                      <span className="text-gray-300">File {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadStatus[index] ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle size={16} />
                          <span className="text-sm">Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={16} />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">
                <CloudUpload size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Upload Files</h3>
            </div>

            <div className="space-y-4 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File {index + 1} {uploadStatus[index] && 
                      <span className="text-green-400 text-xs ml-2">✓ Already uploaded</span>
                    }
                  </label>
                  <div className="relative">
                    <input
  type="file"
  accept={
    index === 0 ? ".ai" :
    index === 1 ? ".doc,.docx" :
    index === 2 ? ".ai" :
    index === 3 ? ".html,.css,.js,.zip" :
    "*/*"
  }
  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
  onChange={(e) => handleFileChange(index, e.target.files[0])}
/>

                    <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 group-hover:border-cyan-500/50 rounded-xl p-4 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-gray-400" />
                          <div>
                            <div id={`file-name-${index}`} className="text-gray-300">
                              {selectedFiles[index] ? (
                                selectedFiles[index].name.length > 30 
                                  ? selectedFiles[index].name.substring(0, 30) + '...'
                                  : selectedFiles[index].name
                              ) : 'Choose a file...'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Click to browse or drag and drop
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFiles.some(Boolean)}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Selected Files
                </>
              )}
            </button>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Supported formats: PDF, DOC, DOCX, JPEG, PNG</p>
              <p>Max file size: 10MB per file</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Student Portal • Secure file submission system</p>
        <p className="mt-1">Logged in as: {student.username}</p>
      </footer>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}