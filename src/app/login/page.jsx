// "use client";
// import { supabase } from "@/lib/supabaseClient";
// import { useState, useEffect } from "react";
// import { LogIn, User, Lock, Eye, EyeOff, Sparkles, Shield } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [alertMessage, setAlertMessage] = useState("");
//   const [alertType, setAlertType] = useState("success");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loginTimeLeft, setLoginTimeLeft] = useState(60); // 1 minute for login page
//   const router = useRouter();

//   // Timer for LOGIN PAGE (1 minute)
//   useEffect(() => {
//     if (loginTimeLeft <= 0) {
//       // Redirect to TIME OVER page
//       router.push("/time-over");
//       return;
//     }

//     const timer = setTimeout(() => {
//       setLoginTimeLeft(loginTimeLeft - 1);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [loginTimeLeft, router]);

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleAdminLogin = () => {
//     router.push("/admin-login");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     setLoading(true);

//     try {
//       const { data, error } = await supabase
//         .from("students")
//         .select("*")
//         .eq("username", username)
//         .eq("password", password)
//         .single();

//       if (error || !data) {
//         setAlertType("error");
//         setAlertMessage("Invalid username or password");
//         setTimeout(() => setAlertMessage(""), 3000);
//         setLoading(false);
//         return;
//       }

//       localStorage.setItem("student", JSON.stringify(data));
//       setAlertType("success");
//       setAlertMessage("Login successful");
//       setTimeout(() => setAlertMessage(""), 3000);
//       router.push("/student-dashboard");

//     } catch (err) {
//       console.error(err);
//       setAlertType("error");
//       setAlertMessage("Unexpected error occurred");
//       setTimeout(() => setAlertMessage(""), 3000);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Custom Alert */}
//       {alertMessage && (
//         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-fade-in">
//           <div
//             className={`px-6 py-3 rounded-xl shadow-xl backdrop-blur-md border transition-all duration-300
//               ${alertType === "success"
//                 ? "bg-green-600/20 border-green-400 text-green-300"
//                 : "bg-red-600/20 border-red-400 text-red-300"
//               }`}
//           >
//             <p className="font-semibold">{alertMessage}</p>
//           </div>
//         </div>
//       )}

//       {/* Admin Login Button - Top Right */}
//       <button
//         onClick={handleAdminLogin}
//         className="absolute top-6 right-6 z-50 group"
//         aria-label="Admin Login"
//       >
//         <div className="relative">
//           <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//           <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 hover:border-purple-500 rounded-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group-hover:scale-105">
//             <Shield 
//               size={20} 
//               className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300" 
//             />
//             <span className="text-white font-medium text-sm hidden sm:inline">
//               Admin Login
//             </span>
//             <span className="text-white font-medium text-sm sm:hidden">
//               Admin
//             </span>
//           </div>
//         </div>
//       </button>

//       {/* Background */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
//         <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
//       </div>

//       {/* Card */}
//       <div className="w-full max-w-md animate-fade-in">
//         <div className="relative">
//           <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur" />
          
//           <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
//             {/* Header */}
//             <div className="text-center mb-10">
//               <div className="relative w-20 h-20 mx-auto mb-6">
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20" />
//                 <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
//                   <div className="relative">
//                     <LogIn size={32} className="text-cyan-400" />
//                     <Sparkles className="absolute -top-1 -right-1 text-yellow-400" size={16} />
//                   </div>
//                 </div>
//               </div>
//               <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                 Student Login
//               </h1>
//               <p className="text-gray-400 font-light">Enter your credentials to continue</p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Username */}
//               <div className="group">
//                 <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 rounded-xl blur group-hover:opacity-100 transition-opacity duration-300" />
//                   <div className="relative flex items-center">
//                     <User className="absolute left-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
//                     <input
//                       type="text"
//                       value={username}
//                       onChange={(e) => setUsername(e.target.value)}
//                       required
//                       className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
//                       placeholder="student@username"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Password */}
//               <div className="group">
//                 <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 rounded-xl blur group-hover:opacity-100 transition-opacity duration-300" />
//                   <div className="relative flex items-center">
//                     <Lock className="absolute left-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       value={password}
//                       required
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-12 py-3.5 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={togglePasswordVisibility}
//                       className="absolute right-4 text-gray-400 hover:text-cyan-400 transition-colors duration-300 focus:outline-none"
//                       aria-label={showPassword ? "Hide password" : "Show password"}
//                     >
//                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Authenticating...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn size={20} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>

//             {/* Admin hint text */}
//             <div className="mt-8 text-center">
//               <p className="text-gray-500 text-sm">
//                 Are you an administrator?{" "}
//                 <button
//                   onClick={handleAdminLogin}
//                   className="text-purple-400 hover:text-purple-300 font-medium underline-offset-2 hover:underline transition-colors duration-300"
//                 >
//                   Click here to login
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { LogIn, User, Lock, Eye, EyeOff, Sparkles, Shield, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false); // Start with TIME OVER
  const [timeOverTimeLeft, setTimeOverTimeLeft] = useState(10 * 24 * 60 * 60); // 10 days in seconds (10 * 24 * 60 * 60)
  const [loginTimeLeft, setLoginTimeLeft] = useState(10 * 24 * 60 * 60); // 10 days in seconds
  const router = useRouter();

  // 10 days in seconds
  const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;

  // Timer for TIME OVER page (10 days) - FIRST SCREEN
  useEffect(() => {
    if (!showLoginForm) {
      if (timeOverTimeLeft <= 0) {
        // Switch to LOGIN FORM after 10 days
        setShowLoginForm(true);
        setLoginTimeLeft(TEN_DAYS_IN_SECONDS); // Reset login timer to 10 days
        return;
      }

      const timer = setTimeout(() => {
        setTimeOverTimeLeft(timeOverTimeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeOverTimeLeft, showLoginForm, TEN_DAYS_IN_SECONDS]);

  // Timer for LOGIN FORM (10 days)
  useEffect(() => {
    if (showLoginForm) {
      if (loginTimeLeft <= 0) {
        // Switch back to TIME OVER after 10 days
        setShowLoginForm(false);
        setTimeOverTimeLeft(TEN_DAYS_IN_SECONDS); // Reset time over timer to 10 days
        return;
      }

      const timer = setTimeout(() => {
        setLoginTimeLeft(loginTimeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loginTimeLeft, showLoginForm, TEN_DAYS_IN_SECONDS]);

  // Format time to Days, Hours, Minutes, Seconds
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format time for display with full details
  const formatTimeDetailed = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    
    return {
      days,
      hours,
      minutes,
      seconds: secs,
      display: `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
    };
  };

  // Calculate percentage for progress bar
  const calculatePercentage = (secondsLeft) => {
    return ((TEN_DAYS_IN_SECONDS - secondsLeft) / TEN_DAYS_IN_SECONDS) * 100;
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleAdminLogin = () => {
    router.push("/admin-login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!showLoginForm) {
      setAlertType("error");
      setAlertMessage("Login period will start in " + formatTime(timeOverTimeLeft));
      setTimeout(() => setAlertMessage(""), 5000);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        setAlertType("error");
        setAlertMessage("Invalid username or password");
        setTimeout(() => setAlertMessage(""), 3000);
        setLoading(false);
        return;
      }

      localStorage.setItem("student", JSON.stringify(data));
      setAlertType("success");
      setAlertMessage("Login successful");
      setTimeout(() => setAlertMessage(""), 3000);
      router.push("/student-dashboard");

    } catch (err) {
      console.error(err);
      setAlertType("error");
      setAlertMessage("Unexpected error occurred");
      setTimeout(() => setAlertMessage(""), 3000);
    }

    setLoading(false);
  };

  // Get current time display
  const timeOverDisplay = formatTimeDetailed(timeOverTimeLeft);
  const loginDisplay = formatTimeDetailed(loginTimeLeft);

  // TIME OVER SCREEN - FIRST SCREEN (shows for 10 days)
  if (!showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8 relative">
        {/* Admin Login Button - Top Right (ADDED TO TIME OVER PAGE) */}
        <button
          onClick={handleAdminLogin}
          className="absolute top-6 right-6 z-50 group"
          aria-label="Admin Login"
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 hover:border-purple-500 rounded-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group-hover:scale-105">
              <Shield 
                size={20} 
                className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300" 
              />
              <span className="text-white font-medium text-sm hidden sm:inline">
                Admin Login
              </span>
              <span className="text-white font-medium text-sm sm:hidden">
                Admin
              </span>
            </div>
          </div>
        </button>

        <div className="text-center w-full max-w-4xl">
          <div className="relative">
            {/* Glowing effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl" />
            
            <div className="relative">
              {/* TIME OVER Text */}
              <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse">
                TIME OVER
              </h1>
              
              {/* Calendar Icon */}
              <div className="my-10">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-20 animate-pulse" />
                  <div className="absolute inset-4 bg-gray-900 rounded-full flex items-center justify-center">
                    <Calendar size={64} className="text-red-400" />
                  </div>
                </div>
              </div>

              {/* Timer for next login period */}
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Next Login Window Opens In:
                </h2>
                <div className="inline-flex items-center gap-3 bg-gray-900/90 backdrop-blur-sm border border-red-700 rounded-2xl px-10 py-6">
                  <Clock size={32} className="text-red-400 animate-pulse" />
                  <div className="text-left">
                    <div className="font-mono font-bold text-4xl text-red-300">
                      {timeOverDisplay.display}
                    </div>
                    <div className="text-gray-400 text-sm mt-2">
                      {timeOverDisplay.days} days, {timeOverDisplay.hours} hours, {timeOverDisplay.minutes} minutes remaining
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-2xl text-gray-400 mb-8">
                Login form will be available for 10 days starting in {formatTime(timeOverTimeLeft)}
              </p>
              
              {/* Detailed Time Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-red-400">{timeOverDisplay.days}</div>
                  <div className="text-gray-400 text-sm">DAYS</div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-orange-400">{timeOverDisplay.hours}</div>
                  <div className="text-gray-400 text-sm">HOURS</div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-yellow-400">{timeOverDisplay.minutes}</div>
                  <div className="text-gray-400 text-sm">MINUTES</div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-amber-400">{timeOverDisplay.seconds}</div>
                  <div className="text-gray-400 text-sm">SECONDS</div>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-gray-400">Time Over Period</span>
                  <span className="text-red-400 font-bold text-xl">
                    {Math.round(calculatePercentage(timeOverTimeLeft))}%
                  </span>
                  <span className="text-gray-400">Next Login Opens</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-1000"
                    style={{ width: `${calculatePercentage(timeOverTimeLeft)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Start (10 days ago)</span>
                  <span>Current</span>
                  <span>Login Opens</span>
                </div>
              </div>

              {/* Admin hint text (ADDED TO TIME OVER PAGE) */}
              <div className="mt-10 p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Shield size={24} className="text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Administrator Access</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Administrators can login anytime using the button at the top right corner.
                </p>
                <button
                  onClick={handleAdminLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-3"
                >
                  <Shield size={20} />
                  Go to Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN FORM SCREEN - Shows after 10 days of TIME OVER
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Custom Alert */}
      {alertMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-fade-in">
          <div
            className={`px-6 py-3 rounded-xl shadow-xl backdrop-blur-md border transition-all duration-300
              ${alertType === "success"
                ? "bg-green-600/20 border-green-400 text-green-300"
                : "bg-red-600/20 border-red-400 text-red-300"
              }`}
          >
            <p className="font-semibold">{alertMessage}</p>
          </div>
        </div>
      )}

      {/* Admin Login Button - Top Right */}
      <button
        onClick={handleAdminLogin}
        className="absolute top-6 right-6 z-50 group"
        aria-label="Admin Login"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 hover:border-purple-500 rounded-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group-hover:scale-105">
            <Shield 
              size={20} 
              className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300" 
            />
            <span className="text-white font-medium text-sm hidden sm:inline">
              Admin Login
            </span>
            <span className="text-white font-medium text-sm sm:hidden">
              Admin
            </span>
          </div>
        </div>
      </button>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur" />
          
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20" />
                <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <LogIn size={32} className="text-cyan-400" />
                    <Sparkles className="absolute -top-1 -right-1 text-yellow-400" size={16} />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Student Login
              </h1>
              <p className="text-gray-400 font-light">10-Day Login Window Active</p>
              
              {/* Current Login Time Remaining */}
              <div className="mt-6 p-4 bg-cyan-900/20 border border-cyan-700/30 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock size={18} className="text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-bold">
                    Login Window Closes In:
                  </span>
                </div>
                <div className="font-mono font-bold text-xl text-white">
                  {loginDisplay.display}
                </div>
              </div>
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

            {/* Information Box */}
            <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-cyan-400" />
                <p className="text-sm font-medium text-white">10-Day Cycle</p>
              </div>
              <p className="text-xs text-gray-400">
                Current: <span className="font-bold text-cyan-300">10-day Login Window</span>
                <br />
                Next: <span className="font-bold text-red-300">10-day Time Over Period</span> starts in {formatTime(loginTimeLeft)}
              </p>
            </div>

            {/* Admin hint text */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Are you an administrator?{" "}
                <button
                  onClick={handleAdminLogin}
                  className="text-purple-400 hover:text-purple-300 font-medium underline-offset-2 hover:underline transition-colors duration-300"
                >
                  Click here to login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}