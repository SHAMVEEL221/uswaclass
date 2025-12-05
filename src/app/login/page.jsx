"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { LogIn, User, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // REMOVED: isMounted state - not needed for this fix

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        alert("Invalid username or password");
        setLoading(false);
        return;
      }

      localStorage.setItem("student", JSON.stringify(data));
      alert("Login successful");
      window.location.href = "/student-dashboard";

    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* SIMPLIFIED Background - NO RANDOM ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Static Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Card with fade-in animation using CSS only */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="relative">
          {/* Static Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur" />
          
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                {/* Static ring - no animation to avoid hydration issues */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20" />
                <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <LogIn size={32} className="text-cyan-400" />
                    <Sparkles className="absolute -top-1 -right-1 text-yellow-400" size={16} />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-400 font-light">Enter your credentials to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 rounded-xl blur group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <User className="absolute left-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                      placeholder="student@username"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 rounded-xl blur group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                    {/* Eye Icon Button */}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 text-gray-400 hover:text-cyan-400 transition-colors duration-300 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-sm">
                Secure login powered by{" "}
                <span className="text-cyan-400 font-medium">Supabase</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}