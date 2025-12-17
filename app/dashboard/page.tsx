"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { GET_PROJECTS, GET_ME } from "@/graphql/queries";
import { CREATE_PROJECT } from "@/graphql/mutations";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/layout/Navbar";
import {
  Project,
  GetMeData,
  GetProjectsData,
  ProjectTeaser,
} from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<GetMeData>(GET_ME);

  useEffect(() => {
    if (meData) {
      const token = localStorage.getItem("token");
      if (token) {
        setAuth(token, meData.me);
      }
    }
  }, [meData, setAuth]);

  useEffect(() => {
    if (meError) {
      router.push("/login");
    }
  }, [meError, router]);

  const { data, loading, refetch } = useQuery<GetProjectsData>(GET_PROJECTS);

  if (meLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const projects = data?.projects || [];
  const filteredProjects = projects.filter(
    (p: ProjectTeaser) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
          >
            + Create Project
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 mb-4">
              {search
                ? "Try a different search term"
                : "Create your first project to get started!"}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: ProjectTeaser) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}/board`)}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded uppercase">
                    {project.key}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {project.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {project.owner.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {project.owner.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {project.members.length}{" "}
                    {project.members.length === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [createProject, { loading }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      onSuccess();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (key.length < 2 || key.length > 5) {
      setError("Project key must be 2-5 characters");
      return;
    }

    createProject({
      variables: {
        name,
        key: key.toUpperCase(),
        description: description || undefined,
      },
    });
  };

  const handleKeyChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setKey(upperValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Create New Project
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Awesome Project"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Key * (2-5 characters)
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="PROJ"
              required
              minLength={2}
              maxLength={5}
            />
            <p className="mt-1 text-xs text-gray-500">
              Example: DEMO, TEST, APP (uppercase letters and numbers only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of your project"
              maxLength={1000}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 transition"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
