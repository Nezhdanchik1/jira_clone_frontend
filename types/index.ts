export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  owner: User;
  members: User[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  taskKey: string;
  project: Project;
  assignee?: User;
  reporter: User;
  position: number;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}
