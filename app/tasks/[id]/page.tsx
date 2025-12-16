"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GET_TASK, GET_COMMENTS, GET_USERS } from "@/graphql/queries";
import {
  UPDATE_TASK,
  DELETE_TASK,
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
} from "@/graphql/mutations";
import { COMMENT_ADDED } from "@/graphql/subscriptions";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import { User, Comment } from "@/types";
import toast from "react-hot-toast";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const currentUser = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const {
    data: taskData,
    loading: taskLoading,
    refetch: refetchTask,
  } = useQuery(GET_TASK, {
    variables: { id: taskId },
  });

  const {
    data: commentsData,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useQuery(GET_COMMENTS, {
    variables: { taskId },
  });

  useSubscription(COMMENT_ADDED, {
    variables: { taskId },
    onData: () => {
      refetchComments();
    },
  });

  const { data: usersData } = useQuery(GET_USERS);

  useEffect(() => {
    if (taskData?.task) {
      setTitle(taskData.task.title);
      setDescription(taskData.task.description || "");
      setStatus(taskData.task.status);
      setPriority(taskData.task.priority);
      setAssigneeId(taskData.task.assignee?.id || "");
    }
  }, [taskData]);

  const [updateTask] = useMutation(UPDATE_TASK, {
    onCompleted: () => {
      toast.success("Task updated successfully!");
      setIsEditing(false);
      refetchTask();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [deleteTask] = useMutation(DELETE_TASK, {
    onCompleted: () => {
      toast.success("Task deleted!");
      router.push(`/projects/${taskData?.task.project.id}/board`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      toast.success("Comment added!");
      setNewComment("");
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [updateComment] = useMutation(UPDATE_COMMENT, {
    onCompleted: () => {
      toast.success("Comment updated!");
      setEditingCommentId(null);
      setEditCommentContent("");
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      toast.success("Comment deleted!");
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-xl">Loading task...</div>
        </div>
      </div>
    );
  }

  const task = taskData?.task;
  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-xl text-red-600">Task not found</div>
        </div>
      </div>
    );
  }

  const comments = commentsData?.comments || [];
  const users = usersData?.users || [];

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    updateTask({
      variables: {
        id: taskId,
        title,
        description: description || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
      },
    });
  };

  const handleDeleteTask = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask({ variables: { id: taskId } });
    }
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createComment({ variables: { content: newComment, taskId } });
    }
  };

  const handleUpdateComment = (commentId: string) => {
    if (editCommentContent.trim()) {
      updateComment({
        variables: { id: commentId, content: editCommentContent },
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Delete this comment?")) {
      deleteComment({ variables: { id: commentId } });
    }
  };

  const priorityColors = {
    HIGH: "bg-red-100 text-red-800 border-red-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    LOW: "bg-green-100 text-green-800 border-green-200",
  };

  const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    DONE: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600">
            Projects
          </Link>
          <span>/</span>
          <Link
            href={`/projects/${task.project.id}/board`}
            className="hover:text-blue-600"
          >
            {task.project.name}
          </Link>
          <span>/</span>
          <span>{task.taskKey}</span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Task Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {task.taskKey}
                </h1>
                <div className="flex space-x-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleDeleteTask}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignee
                      </label>
                      <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Unassigned</option>
                        {users.map((user: User) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {task.title}
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description || "No description provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Comments ({comments.length})
              </h3>

              {/* New Comment */}
              <form onSubmit={handleCreateComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No comments yet
                  </div>
                ) : (
                  comments.map((comment: Comment) => (
                    <div
                      key={comment.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {comment.author.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                              {comment.isEdited && " (edited)"}
                            </p>
                          </div>
                        </div>
                        {comment.author.id === currentUser?.id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditCommentContent(comment.content);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div>
                          <textarea
                            value={editCommentContent}
                            onChange={(e) =>
                              setEditCommentContent(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateComment(comment.id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      statusColors[task.status]
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium border ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Assignee</p>
                  {task.assignee ? (
                    <div className="flex items-center space-x-2">
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Unassigned</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reporter</p>
                  <div className="flex items-center space-x-2">
                    <img
                      src={task.reporter.avatar}
                      alt={task.reporter.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{task.reporter.name}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <span className="text-sm">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Updated</p>
                  <span className="text-sm">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
