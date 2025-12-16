import { gql } from "@apollo/client";

export const TASK_UPDATED = gql`
  subscription TaskUpdated($projectId: ID!) {
    taskUpdated(projectId: $projectId) {
      action
      task {
        id
        title
        status
        priority
        position
        taskKey
        assignee {
          id
          name
          avatar
        }
      }
    }
  }
`;
