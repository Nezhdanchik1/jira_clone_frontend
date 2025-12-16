import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        avatar
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
        avatar
        role
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $key: String!, $description: String) {
    createProject(name: $name, key: $key, description: $description) {
      id
      name
      key
      description
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $name: String, $description: String) {
    updateProject(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const ADD_PROJECT_MEMBER = gql`
  mutation AddProjectMember($projectId: ID!, $userId: ID!) {
    addProjectMember(projectId: $projectId, userId: $userId) {
      id
      members {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const REMOVE_PROJECT_MEMBER = gql`
  mutation RemoveProjectMember($projectId: ID!, $userId: ID!) {
    removeProjectMember(projectId: $projectId, userId: $userId) {
      id
      members {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask(
    $title: String!
    $projectId: ID!
    $priority: TaskPriority
    $description: String
    $assigneeId: ID
  ) {
    createTask(
      title: $title
      projectId: $projectId
      priority: $priority
      description: $description
      assigneeId: $assigneeId
    ) {
      id
      title
      status
      priority
      taskKey
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $title: String
    $description: String
    $status: TaskStatus
    $priority: TaskPriority
    $assigneeId: ID
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      priority: $priority
      assigneeId: $assigneeId
    ) {
      id
      title
      description
      status
      priority
      assignee {
        id
        name
        avatar
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const MOVE_TASK = gql`
  mutation MoveTask($id: ID!, $status: TaskStatus!, $position: Int!) {
    moveTask(id: $id, status: $status, position: $position) {
      id
      status
      position
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($content: String!, $taskId: ID!) {
    createComment(content: $content, taskId: $taskId) {
      id
      content
      createdAt
      author {
        id
        name
        avatar
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      isEdited
      editedAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
