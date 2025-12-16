import { gql } from "@apollo/client";

export const TASK_UPDATED = gql`
  subscription TaskUpdated($projectId: ID!) {
    taskUpdated(projectId: $projectId) {
      action
      task {
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
  }
`;

export const COMMENT_ADDED = gql`
  subscription CommentAdded($taskId: ID!) {
    commentAdded(taskId: $taskId) {
      id
      content
      isEdited
      editedAt
      createdAt
      author {
        id
        name
        avatar
      }
    }
  }
`;
