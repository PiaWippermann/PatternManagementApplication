// in this file, we define the GraphQL queries and mutations for loading discussions and creating new discussions on GitHub.

import { GraphQLClient, gql } from "graphql-request";
import type {
  DiscussionsResponse,
  DiscussionCreationResponse,
  DiscussionUpdateResponse,
} from "../types/GitHub";

const owner = import.meta.env.VITE_REPO_OWNER;
const repo = import.meta.env.VITE_REPO_NAME;
const token =
  localStorage.getItem("github_auth_token") || import.meta.env.VITE_GITHUB_PAT;

const endpoint = "https://api.github.com/graphql";

const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const loadDiscussions = async () => {
  const query = gql`
    query GetDiscussions($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        discussions(first: 100) {
          nodes {
            id
            number
            author {
              avatarUrl
              login
            }
            body
            category {
              id
              name
              description
              emojiHTML
            }
            createdAt
            title
            url
            viewerCanDelete
            viewerCanUpdate
            comments(first: 100) {
              nodes {
                author {
                  login
                  avatarUrl
                }
                body
                id
                publishedAt
                reactions(first: 10) {
                  nodes {
                    content
                    user {
                      name
                      avatarUrl
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { owner, repo };

  const data = await client.request<DiscussionsResponse>(query, variables);
  return data.repository.discussions.nodes;
};

export const createDiscussion = async (
  title: string,
  body: string,
  categoryId: string,
  repositoryId: string
) => {
  const mutation = gql`
    mutation CreateDiscussion($input: CreateDiscussionInput!) {
      createDiscussion(input: $input) {
        discussion {
          id
          title
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      repositoryId: repositoryId,
      title,
      body,
      categoryId,
    },
  };

  const response = await client.request<DiscussionCreationResponse>(
    mutation,
    variables
  );
  return response.createDiscussion.discussion;
};

export const updateDiscussionBody = async (
  discussionId: string,
  newBody: string
) => {
  const mutation = gql`
    mutation UpdateDiscussion($input: UpdateDiscussionInput!) {
      updateDiscussion(input: $input) {
        discussion {
          id
          number
          author {
            avatarUrl
            login
          }
          body
          category {
            id
            name
            description
            emojiHTML
          }
          createdAt
          title
          url
          viewerCanDelete
          viewerCanUpdate
          comments(first: 100) {
            nodes {
              author {
                login
                avatarUrl
              }
              body
              id
              publishedAt
              reactions(first: 10) {
                nodes {
                  content
                  user {
                    name
                    avatarUrl
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      discussionId: discussionId,
      body: newBody,
    },
  };

  const response = await client.request<DiscussionUpdateResponse>(
    mutation,
    variables
  );
  return response.updateDiscussion;
};

export const getRepositoryId = async (): Promise<string> => {
  const query = gql`
    query GetRepoId($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
      }
    }
  `;

  const response = await client.request<{ repository: { id: string } }>(query, {
    owner,
    name: repo,
  });

  return response.repository.id;
};
