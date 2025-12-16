import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      avatar
      role
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      key
      description
      owner {
        id
        name
      }
      members {
        id
        name
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      key
      description
      owner {
        id
        name
        email
      }
      members {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($projectId: ID!) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      priority
      taskKey
      position
      assignee {
        id
        name
        avatar
      }
      reporter {
        id
        name
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      avatar
    }
  }
`;
