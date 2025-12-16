"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700"
          >
            Jira Clone
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Projects
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
