// components/AdminSidebar.jsx
"use client";

import {
  LayoutDashboard,
  UserPlus,
  Users,
  FileSpreadsheet,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add-student", label: "Add Student", icon: UserPlus },
  { id: "students", label: "Student Details", icon: Users },
  { id: "student-file", label: "Student File", icon: FileSpreadsheet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navigateTo = (page) => {
    setActivePage(page);
    // Optional: You can use router.push(`/admin/${page}`) if using routes
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800/50
        `}
      >
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                EduManage
              </h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    activePage === item.id
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-l-4 border-cyan-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {activePage === item.id && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-8 p-4 border-t border-gray-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
            >
              <div className="p-1.5 bg-red-500/20 rounded-lg group-hover:bg-red-500/30">
                <LogOut size={18} />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}