"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GET_TASKS, GET_PROJECT } from "@/graphql/queries";
import Navbar from "@/components/layout/Navbar";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import { Task } from "@/types";

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
  });

  const {
    data: tasksData,
    loading: tasksLoading,
    refetch,
  } = useQuery(GET_TASKS, {
    variables: { projectId },
  });

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];

  const todoTasks = tasks.filter((t: Task) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t: Task) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t: Task) => t.status === "DONE");

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-xl">Loading project...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link href="/dashboard" className="hover:text-blue-600">
              Projects
            </Link>
            <span>/</span>
            <span>{project?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {project?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {project?.key} • Kanban Board
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                + Create Task
              </button>
              <Link
                href={`/projects/${projectId}/settings`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        {tasksLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Column
              title="To Do"
              tasks={todoTasks}
              status="TODO"
              count={todoTasks.length}
            />
            <Column
              title="In Progress"
              tasks={inProgressTasks}
              status="IN_PROGRESS"
              count={inProgressTasks.length}
            />
            <Column
              title="Done"
              tasks={doneTasks}
              status="DONE"
              count={doneTasks.length}
            />
          </div>
        )}
      </div>

      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowCreateTaskModal(false)}
          onSuccess={() => {
            setShowCreateTaskModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function Column({
  title,
  tasks,
  status,
  count,
}: {
  title: string;
  tasks: Task[];
  status: string;
  count: number;
}) {
  const priorityColors = {
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 uppercase text-sm">
          {title}
        </h3>
        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No tasks</div>
        ) : (
          tasks.map((task: Task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm flex-1 pr-2">
                  {task.title}
                </h4>
                <span
                  className={`px-2 py-1 text-xs rounded font-medium ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {task.taskKey}
                </span>
                {task.assignee ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      className="w-6 h-6 rounded-full ring-2 ring-blue-500"
                      title={task.assignee.name}
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
