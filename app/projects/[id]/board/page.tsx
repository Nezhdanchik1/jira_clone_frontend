"use client";

import { useState } from "react";
import { useQuery, useSubscription, useMutation } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GET_TASKS, GET_PROJECT } from "@/graphql/queries";
import { MOVE_TASK } from "@/graphql/mutations";
import { TASK_UPDATED } from "@/graphql/subscriptions";
import Navbar from "@/components/layout/Navbar";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import { Task } from "@/types";
import toast from "react-hot-toast";

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const [moveTask] = useMutation(MOVE_TASK, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      refetch();
    },
  });

  useSubscription(TASK_UPDATED, {
    variables: { projectId },
    onData: () => {
      refetch();
    },
  });

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];

  const todoTasks = tasks.filter((t: Task) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t: Task) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t: Task) => t.status === "DONE");

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t: Task) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as "TODO" | "IN_PROGRESS" | "DONE";

    const task = tasks.find((t: Task) => t.id === taskId);
    if (!task) return;

    // Если статус не изменился, ничего не делаем
    if (task.status === newStatus) return;

    // Получаем задачи в новом статусе
    const targetTasks = tasks.filter((t: Task) => t.status === newStatus);
    const newPosition = targetTasks.length;

    // Оптимистичное обновление UI
    toast.promise(
      moveTask({
        variables: {
          id: taskId,
          status: newStatus,
          position: newPosition,
        },
      }),
      {
        loading: "Moving task...",
        success: "Task moved successfully!",
        error: "Failed to move task",
      }
    );
  };

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
                <span className="ml-2 text-green-600 text-xs">● Live</span>
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
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-3 gap-4">
              <Column
                id="TODO"
                title="To Do"
                tasks={todoTasks}
                count={todoTasks.length}
                router={router}
              />
              <Column
                id="IN_PROGRESS"
                title="In Progress"
                tasks={inProgressTasks}
                count={inProgressTasks.length}
                router={router}
              />
              <Column
                id="DONE"
                title="Done"
                tasks={doneTasks}
                count={doneTasks.length}
                router={router}
              />
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
            </DragOverlay>
          </DndContext>
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
  id,
  title,
  tasks,
  count,
  router,
}: {
  id: string;
  title: string;
  tasks: Task[];
  count: number;
  router: any;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-gray-100 rounded-lg p-4 min-h-[500px]">
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
          <div className="text-center py-8 text-gray-400 text-sm">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task: Task) => (
            <DraggableTask key={task.id} task={task} router={router} />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableTask({ task, router }: { task: Task; router: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} router={router} />
    </div>
  );
}

function TaskCard({
  task,
  router,
  isDragging = false,
}: {
  task: Task;
  router?: any;
  isDragging?: boolean;
}) {
  const priorityColors = {
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };

  return (
    <div
      onClick={(e) => {
        if (!isDragging && router) {
          e.stopPropagation();
          router.push(`/tasks/${task.id}`);
        }
      }}
      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition border border-gray-200 ${
        isDragging ? "rotate-3" : ""
      }`}
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
          <img
            src={task.assignee.avatar}
            alt={task.assignee.name}
            className="w-6 h-6 rounded-full ring-2 ring-blue-500"
            title={task.assignee.name}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-400">?</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Импорты для DnD
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
