"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GET_PROJECT, GET_USERS } from "@/graphql/queries";
import {
  UPDATE_PROJECT,
  DELETE_PROJECT,
  ADD_PROJECT_MEMBER,
  REMOVE_PROJECT_MEMBER,
} from "@/graphql/mutations";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";
import toast from "react-hot-toast";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const currentUser = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const {
    data: projectData,
    loading,
    refetch,
  } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
  });

  useEffect(() => {
    if (projectData?.project) {
      setName(projectData.project.name);
      setDescription(projectData.project.description || "");
    }
  }, [projectData]);

  const { data: usersData } = useQuery(GET_USERS);

  const [updateProject] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      toast.success("Project updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      toast.success("Project deleted!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [addMember] = useMutation(ADD_PROJECT_MEMBER, {
    onCompleted: () => {
      toast.success("Member added successfully!");
      setShowAddMember(false);
      setSelectedUserId("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [removeMember] = useMutation(REMOVE_PROJECT_MEMBER, {
    onCompleted: () => {
      toast.success("Member removed!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  const project = projectData?.project;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-xl text-red-600">Project not found</div>
        </div>
      </div>
    );
  }

  const isOwner = project.owner.id === currentUser?.id;
  const availableUsers = (usersData?.users || []).filter(
    (user: User) => !project.members.find((m: User) => m.id === user.id)
  );

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject({
      variables: { id: projectId, name, description },
    });
  };

  const handleDeleteProject = () => {
    if (
      confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      deleteProject({ variables: { id: projectId } });
    }
  };

  const handleAddMember = () => {
    if (selectedUserId) {
      addMember({
        variables: { projectId, userId: selectedUserId },
      });
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Remove this member from the project?")) {
      removeMember({
        variables: { projectId, userId },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link href="/dashboard" className="hover:text-blue-600">
              Projects
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${projectId}/board`}
              className="hover:text-blue-600"
            >
              {project.name}
            </Link>
            <span>/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isOwner}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Key
              </label>
              <input
                type="text"
                value={project.key}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            {isOwner && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            )}
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Members ({project.members.length})
            </h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + Add Member
            </button>
          </div>

          <div className="space-y-3">
            {project.members.map((member: User) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  {member.id === project.owner.id && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      Owner
                    </span>
                  )}
                </div>
                {isOwner && member.id !== project.owner.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <p className="text-gray-600 mb-4">
              Once you delete a project, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Project
            </button>
          </div>
        )}

        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Member</h2>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="">Select a user</option>
                {availableUsers.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
