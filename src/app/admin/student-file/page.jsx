"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { LogOut } from "lucide-react"; // Import logout icon

export default function StudentFileAdmin() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [pendingResults, setPendingResults] = useState({}); // Store temporary results
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    // First, get all students from the students table
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*");

    if (studentError) {
      console.log(studentError);
      return;
    }

    // Then get all student files
    const { data: fileData, error: fileError } = await supabase
      .from("student_files")
      .select("*");

    if (fileError) {
      console.log(fileError);
      // Continue even if no files yet
    }

    // Merge data: combine student info with file info
    const mergedData = studentData.map(student => {
      // Find matching file record by username
      const fileRecord = fileData?.find(file => file.username === student.username) || {};
      
      return {
        ...student, // From students table: student_name, student_class, username
        ...fileRecord, // From student_files table: file URLs and result
        // Make sure we have all file fields even if empty
        file1_url: fileRecord.file1_url || null,
        file2_url: fileRecord.file2_url || null,
        file3_url: fileRecord.file3_url || null,
        result: fileRecord.result || null
      };
    });

    setStudents(mergedData || []);
    // Initialize pending results with current database results
    const initialPending = {};
    mergedData.forEach(student => {
      initialPending[student.username] = student.result || "pending";
    });
    setPendingResults(initialPending);

    // Extract unique classes for filter dropdown
    const classes = [...new Set(studentData.map(s => s.student_class))].sort();
    setUniqueClasses(classes);
  }

  // ⭐ Set temporary result (not saved to database yet)
  const setTemporaryResult = (username, status) => {
    setPendingResults(prev => ({
      ...prev,
      [username]: status
    }));
  };

  // ⭐ Publish ALL results to database
  const publishResults = async () => {
    if (Object.keys(pendingResults).length === 0) {
      alert("No results to publish");
      return;
    }

    setIsPublishing(true);
    
    try {
      // Convert pendingResults object to array of updates
      const updates = Object.entries(pendingResults).map(([username, result]) => ({
        username,
        result
      }));

      // Batch update all results
      for (const update of updates) {
        // First check if record exists in student_files
        const { data: existing } = await supabase
          .from("student_files")
          .select("*")
          .eq("username", update.username)
          .single();

        if (existing) {
          // Update existing record
          await supabase
            .from("student_files")
            .update({ result: update.result })
            .eq("username", update.username);
        } else {
          // Insert new record if student has uploaded files
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

      alert("Results published successfully!");
      loadStudents(); // Reload to refresh data
    } catch (error) {
      console.error("Error publishing results:", error);
      alert("Failed to publish results");
    } finally {
      setIsPublishing(false);
    }
  };

  // ⭐ Logout function
  const handleLogout = () => {
    // Clear any admin session data if needed
    localStorage.removeItem("admin"); // If you have admin session storage
    // Redirect to login page
    window.location.href = "/admin-login"; // Change to your login route
  };

  // ⭐ Download Single File (original filename keep)
  const downloadSingleFile = async (fileUrl, student) => {
    if (!fileUrl) return;
    
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const originalName = fileUrl.split("/").pop();  // keep actual filename

    const fileName = `${student.username}-${student.student_name}-${originalName}`;
    saveAs(blob, fileName);
  };

  // ⭐ Download ALL files as ZIP (3 files only)
  const downloadZip = async (student) => {
    const zip = new JSZip();

    for (let i = 1; i <= 3; i++) {
      const url = student[`file${i}_url`];
      if (!url) continue;

      const response = await fetch(url);
      const blob = await response.blob();

      const originalName = url.split("/").pop();

      zip.file(originalName, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    saveAs(content, `${student.username}-${student.student_name}.zip`);
  };

  // ⭐ Search + Class filter
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      stu.username?.toLowerCase().includes(search.toLowerCase());

    const matchesClass =
      classFilter === "" || stu.student_class === classFilter;

    return matchesSearch && matchesClass;
  });

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return students.some(student => {
      const dbResult = student.result || "pending";
      const pendingResult = pendingResults[student.username] || "pending";
      return dbResult !== pendingResult;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">
          Student File Management
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Publish Button */}
          <button
            onClick={publishResults}
            disabled={!hasUnsavedChanges() || isPublishing}
            className={`px-4 py-2 rounded-lg font-semibold ${
              hasUnsavedChanges() 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            {isPublishing ? "Publishing..." : "Publish Results"}
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search student..."
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg w-60"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg"
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">Filter by Class</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>

        {hasUnsavedChanges() && (
          <div className="flex items-center text-yellow-400">
            <span className="animate-pulse">●</span>
            <span className="ml-2">Unsaved changes</span>
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-xl overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-cyan-300 border-b border-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Class</th>
              <th className="p-3">Files</th>
              <th className="p-3">Result</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No students found
                </td>
              </tr>
            )}

            {filteredStudents.map((stu, i) => {
              const pendingResult = pendingResults[stu.username] || stu.result || "pending";
              const hasChanged = (stu.result || "pending") !== pendingResult;
              
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-700 hover:bg-gray-700 transition ${
                    hasChanged ? "bg-gray-750" : ""
                  }`}
                >
                  <td className="p-3">{stu.student_name}</td>
                  <td className="p-3">{stu.username}</td>
                  <td className="p-3">Class {stu.student_class}</td>

                  {/* FILE BUTTONS */}
                  <td className="p-3">
                    <div className="flex gap-3">
                      {[1, 2, 3].map((num) => (
                        <div key={num}>
                          {stu[`file${num}_url`] ? (
                            <button
                              onClick={() =>
                                downloadSingleFile(stu[`file${num}_url`], stu)
                              }
                              className="text-green-400 underline"
                            >
                              File {num}
                            </button>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Result - Shows pending result */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {hasChanged && (
                        <span className="text-yellow-400 text-xs">*</span>
                      )}
                      {pendingResult === "approved" ? (
                        <span className="text-green-400">Approved</span>
                      ) : pendingResult === "rejected" ? (
                        <span className="text-red-400">Rejected</span>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </div>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-3 flex gap-3">
                    <button
                      className={`px-3 py-1 rounded ${
                        pendingResult === "approved" 
                          ? "bg-green-700 border border-green-500" 
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={() => setTemporaryResult(stu.username, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      className={`px-3 py-1 rounded ${
                        pendingResult === "rejected" 
                          ? "bg-red-700 border border-red-500" 
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      onClick={() => setTemporaryResult(stu.username, "rejected")}
                    >
                      Reject
                    </button>

                    <button
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                      onClick={() => downloadZip(stu)}
                      disabled={!stu.file1_url && !stu.file2_url && !stu.file3_url}
                    >
                      ZIP
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Publish Status */}
      {hasUnsavedChanges() && (
        <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-yellow-600">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-yellow-400 font-semibold">⚠️ Unsaved Results</h3>
              <p className="text-gray-400 text-sm mt-1">
                You have {Object.keys(pendingResults).filter(username => {
                  const student = students.find(s => s.username === username);
                  const dbResult = student?.result || "pending";
                  return pendingResults[username] !== dbResult;
                }).length} unsaved result(s). Click "Publish Results" to save them to the database.
              </p>
            </div>
            <button
              onClick={publishResults}
              disabled={isPublishing}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold"
            >
              {isPublishing ? "Publishing..." : "Publish Now"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}