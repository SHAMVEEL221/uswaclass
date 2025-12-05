"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { LogOut, Upload, Home, Clock, CheckCircle, XCircle } from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [uploadStatus, setUploadStatus] = useState([false, false, false, false]);
  const [files, setFiles] = useState([null, null, null, null]);
  const [selectedFiles, setSelectedFiles] = useState([null, null, null, null]);
  const [resultStatus, setResultStatus] = useState("pending");

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
    const updated = [...selectedFiles];
    updated[index] = file;
    setSelectedFiles(updated);
  };

  const handleUpload = async () => {
    if (!selectedFiles.some(Boolean)) {
      alert("Please select at least one file");
      return;
    }

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
        result: "pending"  // Default result status
      });
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      if (!selectedFiles[i]) continue;

      const file = selectedFiles[i];
      const filePath = `student-uploads/${student.username}/file${i + 1}-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("albayan")
        .upload(filePath, file);

      if (uploadError) {
        console.log(uploadError);
        alert(`Upload failed for file ${i + 1}`);
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

      // Mark success (show green tick)
      setUploadStatus(prev => {
        const updated = [...prev];
        updated[i] = true;
        return updated;
      });
    }

    // Reset result to pending when new files are uploaded
    await supabase
      .from("student_files")
      .update({ result: "pending" })
      .eq("username", student.username);
    
    setResultStatus("pending");

    alert("Files uploaded successfully!");
  };

  if (!student) return null;

  // Function to render result status with appropriate styling
  const renderResultStatus = () => {
    switch (resultStatus) {
      case "approved":
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={20} />
            <span className="font-semibold">Approved ✓</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 text-red-400">
            <XCircle size={20} />
            <span className="font-semibold">Rejected ✗</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-yellow-400">
            <Clock size={20} />
            <span className="font-semibold">Pending Review</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">

      {/* NAVBAR */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Home size={22} />
          Student Dashboard
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto">

        {/* STUDENT DETAILS */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-cyan-400">Student Details</h2>
          <p className="text-lg pt-3"><strong>Name:</strong> {student.student_name}</p>
          <p className="text-lg"><strong>Class:</strong> {student.student_class}</p>
          <p className="text-lg"><strong>Username:</strong> {student.username}</p>
        </div>

        {/* RESULT STATUS */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-center">Submission Status</h3>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-xl">
              {renderResultStatus()}
            </div>
            
            {resultStatus === "pending" && (
              <div className="text-gray-400 text-center text-sm">
                Your files are under review. The admin will update your status soon.
              </div>
            )}
            
            {resultStatus === "approved" && (
              <div className="text-green-400 text-center text-sm">
                Congratulations! Your submission has been approved.
              </div>
            )}
            
            {resultStatus === "rejected" && (
              <div className="text-red-400 text-center text-sm">
                Your submission has been rejected. Please contact your admin for details.
              </div>
            )}
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Upload Your Files</h3>

          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                File {index + 1}
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                />

                {/* GREEN CHECKMARK */}
                {uploadStatus[index] ? (
                  <span className="text-green-500 text-xl">✔️</span>
                ) : (
                  <span className="text-gray-500 text-xl">⏳</span>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleUpload}
            className="bg-cyan-600 hover:bg-cyan-700 w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
          >
            <Upload size={20} />
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
}