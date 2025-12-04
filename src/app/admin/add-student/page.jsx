"use client";

import { useState } from "react";
import { UserPlus, Copy, CheckCircle, RefreshCw, User, GraduationCap, Key } from "lucide-react";

export default function AddStudent() {
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePassword = () => {
    const pwd = Math.floor(10000 + Math.random() * 90000).toString(); // 6 digits
    setPassword(pwd);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch("/api/add-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: studentName,
        student_class: studentClass,
        username,
        password,
      }),
    });

    const data = await res.json();
    setMessage(data.message);

    if (data.success) {
      setStudentName("");
      setStudentClass("");
      setUsername("");
      setPassword("");
    }

    setIsSubmitting(false);
  };

  return (
   <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">

      <div className="w-full max-w-lg">

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">

          {/* Heading */}
          <div className="bg-gray-900 p-6 text-center border-b border-gray-700">
            <h1 className="text-2xl font-bold text-cyan-400">Add Student</h1>
            <p className="text-gray-400 text-sm">Fill details to register student</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Student Name */}
            <div>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <User size={16} /> Student Name
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 outline-none"
                placeholder="Enter full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            {/* Class */}
            <div>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <GraduationCap size={16} /> Class / Grade
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 outline-none"
                placeholder="e.g., Grade 8, Class 10A"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                required
              />
            </div>

            {/* Username (manual typing) */}
            <div>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <User size={16} /> Username
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 outline-none"
                placeholder="Set username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password (auto generate only) */}
            <div>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <Key size={16} /> Password (Auto)
              </label>

              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 outline-none font-mono"
                  value={password}
                  readOnly
                />

                {password && (
                  <button
                    type="button"
                    onClick={() => handleCopy(password, "password")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300"
                  >
                    {copied === "password" ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={generatePassword}
                className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-medium"
              >
                <RefreshCw size={16} className="inline-block mr-2" />
                Generate Password
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold disabled:opacity-40"
            >
              {isSubmitting ? "Adding..." : "Add Student"}
            </button>

            {/* Message */}
            {message && (
              <p className="text-center text-sm text-cyan-300">
                {message}
              </p>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}
