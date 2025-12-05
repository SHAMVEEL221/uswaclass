"use client";

import { useState, useEffect } from "react";
import { LogIn, User, Lock, Eye, EyeOff, Shield, Key, Server } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
    setIsMounted(true);

    // If admin already logged in → go to dashboard
    if (localStorage.getItem("admin")) {
      window.location.href = "/admin/student-file";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (data.success) {
        // SAVE ADMIN IN LOCALSTORAGE
        localStorage.setItem(
          "admin",
          JSON.stringify({ username: username, loggedIn: true })
        );

        // Redirect after 1 second
        setTimeout(() => {
          window.location.href = "/admin/student-file";
        }, 1000);
      }
    } catch (error) {
      setMessage("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        
        {/* Floating Security Icons */}
        <div className="absolute top-1/4 left-10 animate-float-slow opacity-20">
          <Shield size={32} className="text-blue-400" />
        </div>
        <div className="absolute bottom-1/4 right-10 animate-float opacity-20">
          <Key size={32} className="text-purple-400" />
        </div>
      </div>

      <div className={`w-full max-w-md transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Glass Card */}
        <div className="relative">
          {/* Outer Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                {/* Animated Ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <Lock size={32} className="text-blue-400" />
                    <Server className="absolute -bottom-1 -right-1 text-cyan-400" size={16} />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="text-gray-400 font-light">Restricted Administrative Access</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                  Username
                </label>
                <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                      placeholder="Enter admin username"
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                  Password
                </label>
                <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                      placeholder="Enter admin password"
                    />
                    {/* Eye Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-400 hover:text-blue-400 transition-colors duration-300 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`animate-slide-in p-3 rounded-lg text-center ${
                  message.includes("success") 
                    ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                    : "bg-red-900/30 text-red-400 border border-red-800/50"
                }`}>
                  <p className="font-medium">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                      Sign In to Dashboard
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-800/50">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield size={14} />
                <span>Secure Admin Access • Logs are monitored</span>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}