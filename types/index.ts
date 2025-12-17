export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role?: "USER" | "ADMIN";
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  owner: User;
  members: User[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  taskKey: string;
  project: Project;
  assignee?: User | null;
  reporter: User;
  position: number;
  createdAt: string;
  updatedAt: string;
}


export interface Comment {
  id: string;
  content: string;
  author: User;
  isEdited: boolean;
  editedAt?: string | null;
  createdAt: string;
}

export interface LoginData {
  login: {
    token: string;
    user: User;
  };
}

export interface RegisterData {
  register: {
    token: string;
    user: User;
  };
}

export interface GetMeData {
  me: User;
}

export interface ProjectTeaser {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  owner: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    name: string;
  }[];
}

export interface GetProjectsData {
  projects: ProjectTeaser[];
}

export interface GetProjectData {
  project: Project;
}

export interface TaskTeaser {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  taskKey: string;
  position: number;
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  reporter: {
    id: string;
    name: string;
  };
}

export interface GetTasksData {
  tasks: TaskTeaser[];
}

export interface GetUsersData {
  users: User[];
}

export interface TaskDetail {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  taskKey: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  } | null;
  reporter: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
}

export interface GetTaskData {
  task: TaskDetail;
}

export interface CommentDetail {
  id: string;
  content: string;
  isEdited: boolean;
  editedAt?: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface GetCommentsData {
  comments: CommentDetail[];
}

