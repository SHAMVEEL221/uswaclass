"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { LogOut, Upload, Home } from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [files, setFiles] = useState([null, null, null, null]);

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    if (!storedStudent) {
      window.location.href = "/login";
      return;
    }
    setStudent(JSON.parse(storedStudent));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("student");
    window.location.href = "/login";
  };

  const handleFileChange = (index, file) => {
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
  if (!files.some(Boolean)) {
    alert("Please select at least one file");
    return;
  }

  // 1️⃣ Check if student row exists — if not create it
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
    });
  }

  // 2️⃣ Upload each file & update specific column
  for (let i = 0; i < files.length; i++) {
    if (!files[i]) continue;

    const file = files[i];
    const filePath = `student-uploads/${student.username}/file${i + 1}-${Date.now()}-${file.name}`;

    // Upload file to bucket
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

    // Update only one column (file1_url, file2_url...)
    await supabase
      .from("student_files")
      .update({
        [`file${i + 1}_url`]: publicUrl,
      })
      .eq("username", student.username);
  }

  alert("All selected files uploaded successfully! 🎉");
};



  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">

      {/* Navbar */}
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

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto">

        {/* Student Info */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-cyan-400">Student Details</h2>
          <p className="text-lg pt-3"><strong>Name:</strong> {student.student_name}</p>
          <p className="text-lg"><strong>Class:</strong> {student.student_class}</p>
          <p className="text-lg"><strong>Username:</strong> {student.username}</p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Upload Your Files</h3>

          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                File {index + 1}
              </label>
              <input
                type="file"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                onChange={(e) => handleFileChange(index, e.target.files[0])}
              />
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
