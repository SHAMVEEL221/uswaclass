"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Dashboard", path: "/admin" },
    { label: "Student Details", path: "/admin/students" },
    { label: "Add Student", path: "/admin/add-student" },
    { label: "Student Files", path: "/admin/student-files" },
    { label: "Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/admin-login");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <h1 className="font-bold text-lg">Admin Panel</h1>
        <button onClick={() => setOpen(true)}>
          <Menu size={26} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-gray-900 border-r border-gray-800 shadow-xl flex flex-col justify-between transition-transform z-50
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-cyan-400">Admin Panel</h2>
            <button
              className="md:hidden text-gray-300"
              onClick={() => setOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setOpen(false)}
                className={`px-6 py-3 text-sm font-medium transition ${
                  pathname === link.path
                    ? "bg-cyan-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex gap-2 items-center justify-center font-semibold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
