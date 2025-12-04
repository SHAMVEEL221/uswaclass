"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff, Search, Download, Filter, User, Key, GraduationCap, FileText, RefreshCw, AlertCircle, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

export default function AdminStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.push("/login");
      return;
    }
    
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("student_class", { ascending: true })
        .order("student_name", { ascending: true });

      if (error) {
        throw error;
      }

      if (!data) {
        setStudents([]);
        setFiltered([]);
      } else {
        setStudents(data);
        setFiltered(data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFilter = () => {
    let results = students;

    if (search.trim() !== "") {
      results = results.filter(
        (s) =>
          s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
          s.username?.toLowerCase().includes(search.toLowerCase())
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

  // Enhanced Excel styling function
  const applyExcelStyling = (ws, data) => {
    // Define styles
    const styles = {
      header: {
        fill: {
          fgColor: { rgb: "2D3748" } // Gray-800
        },
        font: {
          bold: true,
          color: { rgb: "FFFFFF" }, // White
          sz: 14
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        },
        border: {
          top: { style: "thin", color: { rgb: "4A5568" } },
          bottom: { style: "thin", color: { rgb: "4A5568" } },
          left: { style: "thin", color: { rgb: "4A5568" } },
          right: { style: "thin", color: { rgb: "4A5568" } }
        }
      },
      title: {
        font: {
          bold: true,
          color: { rgb: "06B6D4" }, // Cyan-500
          sz: 16
        },
        alignment: {
          horizontal: "center"
        }
      },
      evenRow: {
        fill: {
          fgColor: { rgb: "F7FAFC" } // Gray-50
        }
      },
      oddRow: {
        fill: {
          fgColor: { rgb: "FFFFFF" } // White
        }
      },
      dataCell: {
        font: {
          color: { rgb: "1A202C" }, // Gray-900
          sz: 11
        },
        alignment: {
          vertical: "center"
        },
        border: {
          top: { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left: { style: "thin", color: { rgb: "E2E8F0" } },
          right: { style: "thin", color: { rgb: "E2E8F0" } }
        }
      },
      classCell: {
        font: {
          bold: true,
          color: { rgb: "059669" } // Emerald-600
        }
      }
    };

    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [["STUDENT MANAGEMENT SYSTEM"]], { origin: "A1" });
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    ws["A1"].s = styles.title;

    // Add date row
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    XLSX.utils.sheet_add_aoa(ws, [[`Exported on: ${date}`]], { origin: "A2" });
    ws["!merges"] = [...(ws["!merges"] || []), { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }];
    ws["A2"].s = {
      font: {
        italic: true,
        color: { rgb: "718096" }, // Gray-500
        sz: 10
      }
    };

    // Add header row
    const headers = ["S.No", "Student Name", "Class", "Username", "Password"];
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A4" });

    // Apply header styling
    for (let i = 0; i < headers.length; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 3, c: i });
      ws[cellAddress].s = styles.header;
      ws[cellAddress].w = headers[i].length < 12 ? 12 : headers[i].length;
    }

    // Add data rows
    data.forEach((student, index) => {
      const row = [
        index + 1,
        student.student_name,
        `Class ${student.student_class}`,
        student.username,
        student.password
      ];
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: `A${5 + index}` });

      // Apply row styling
      for (let i = 0; i < row.length; i++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 4 + index, c: i });
        ws[cellAddress].s = {
          ...styles.dataCell,
          fill: index % 2 === 0 ? styles.evenRow.fill : styles.oddRow.fill
        };

        // Special styling for class column
        if (i === 2) {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            ...styles.classCell
          };
        }
      }
    });

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // S.No
      { wch: 25 }, // Student Name
      { wch: 12 }, // Class
      { wch: 20 }, // Username
      { wch: 20 }  // Password
    ];
  };

  const downloadExcel = (data, filename) => {
    setExporting(true);
    try {
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet([]);
      
      // Apply custom styling
      applyExcelStyling(ws, data);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");

      // Generate Excel file with styling
      const excelBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
        bookSST: false,
        cellStyles: true
      });

      const blob = new Blob([excelBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" 
      });
      
      saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Failed to export Excel file. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const downloadStudentData = (student) => {
    if (exporting) return;
    downloadExcel([student], `student_${student.username}`);
  };

  const downloadAllStudents = () => {
    if (filtered.length === 0 || exporting) {
      alert("No Data to Download!");
      return;
    }
    downloadExcel(filtered, "all_students");
  };

  const downloadClassWise = () => {
    if (filtered.length === 0 || exporting) {
      alert("No Data to Download!");
      return;
    }

    // Group by class
    const groupedByClass = filtered.reduce((acc, student) => {
      const className = `Class ${student.student_class}`;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student);
      return acc;
    }, {});

    // Download each class separately
    Object.entries(groupedByClass).forEach(([className, students]) => {
      downloadExcel(students, className.replace(/ /g, '_').toLowerCase());
    });
  };

  const handleAddStudent = () => {
    router.push("/admin/add-student");
  };

  useEffect(() => {
    handleSearchFilter();
  }, [search, classFilter, students]);

  const uniqueClasses = [...new Set(students.map((s) => s.student_class))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <div className="md:ml-64 p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <GraduationCap size={24} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Student Management
                </h1>
              </div>
              <p className="text-gray-400">Manage and export student information</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchStudents}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              
              <button
                onClick={handleAddStudent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium transition-all"
              >
                <Plus size={18} />
                Add Student
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                disabled={loading}
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
                disabled={filtered.length === 0 || loading || exporting}
                className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Download size={18} className={exporting ? "animate-pulse" : ""} />
                {exporting ? "Exporting..." : "Export All"}
              </button>
              
              <button
                onClick={downloadClassWise}
                disabled={filtered.length === 0 || loading || exporting}
                className="flex-1 lg:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FileText size={18} className={exporting ? "animate-pulse" : ""} />
                {exporting ? "Exporting..." : "By Class"}
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
                            disabled={loading}
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
                          disabled={exporting}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Exported Excel files include custom styling, headers, and proper formatting</p>
          <p className="mt-1">Total records: {students.length} | Filtered: {filtered.length} | Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}