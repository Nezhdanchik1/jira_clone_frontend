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

export const MOVE_TASK = gql`
  mutation MoveTask($id: ID!, $status: TaskStatus!, $position: Int!) {
    moveTask(id: $id, status: $status, position: $position) {
      id
      status
      position
    }
  }
`;
