// in this file, we define the GraphQL queries and mutations for loading discussions and creating new discussions on GitHub.
import { GraphQLClient, gql } from "graphql-request";
import type {
  BaseDiscussion,
  DiscussionCreationResponse,
  DiscussionUpdateResponse,
  Comment
} from "../types/GitHub";
import type { RepositoryIds } from "../types/DiscussionData";

// load environment variables for repository owner, and repository name
const owner = import.meta.env.VITE_REPO_OWNER;
const repo = import.meta.env.VITE_REPO_NAME;
const endpoint = import.meta.env.VITE_GITHUB_ENDPOINT;

// for now, we use the PAT token, but in future we want to implement OAuth flow
const token =
  localStorage.getItem("github_auth_token") || import.meta.env.VITE_GITHUB_PAT;

// initialize the GraphQL client with the endpoint and authorization header
const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Queries and mutations defined below

// Query to get repository and discussion category IDs
const GET_REPO_IDS_QUERY = gql`
  query GetIds($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      discussionCategories(first: 100) {
        nodes {
          id
          name
        }
      }
    }
  }
`;

// Query to get a discussion by its ID
const GET_SIMPLE_DISCUSSION_BY_NUMBER_QUERY = gql`
  query GetDiscussionByNumber($repoOwner: String!, $repoName: String!, $discussionNumber: Int!) {
  repository(owner: $repoOwner, name: $repoName) {
    discussion(number: $discussionNumber) {
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
    }
  }
}
`;

// Includes comments and reactions in the query
const GET_MAPPING_DISCUSSION_BY_NUMBER_QUERY = gql`
  query GetDiscussionByNumber($repoOwner: String!, $repoName: String!, $discussionNumber: Int!) {
  repository(owner: $repoOwner, name: $repoName) {
    discussion(number: $discussionNumber) {
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
      comments(first: 20) {
        nodes {
          id
          body
          publishedAt
          author {
            login
            avatarUrl
          }
          reactions(first: 10) {
            nodes {
              content
              user {
                login
                avatarUrl
              }
            }
          }
        }
      }
      reactions(first: 10) {
        nodes {
          content
          user {
            login
            avatarUrl
          }
        }
      }
    }
  }
}
`;

// Query to get discussion base information with pagination and by category
const GET_DISCUSSIONS_QUERY = gql`
  query GetDiscussions($first: Int!, $after: String, $categoryId: ID!, $owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussions(first: $first, after: $after, categoryId: $categoryId) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          title
          number
        }
      }
    }
  }
`;

// Mutation to create a discussion
const CREATE_DISCUSSION_MUTATION = gql`
    mutation CreateDiscussion($input: CreateDiscussionInput!) {
      createDiscussion(input: $input) {
        discussion {
          id
          title
          url
          number
          author {
            avatarUrl
            login
          }
          category {
            id
            name
            description
            emojiHTML
          }
          createdAt
          body
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
          reactions(first: 10) {
            nodes {
              content
              user {
                login
                avatarUrl
              }
            }
          }
        }
      }
    }
  `;

// Mutation to update a discussion
const UPDATE_DISCUSSION_MUTATION = gql`
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

// Corrected Mutation to add a discussion comment
const ADD_DISCUSSION_COMMENT = gql`
  mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
      comment {
        id
        body
        publishedAt
        author {
          login
          avatarUrl
        }
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
`;

/**
 * Gets a paginated list of discussions for a given category.
 * This category can be either referred to as "Patterns" or "Realizations".
 * * @param categoryId 
 * @param cursor 
 * @param pageSize 
 * @returns 
 */
export const getDiscussionsListData = async (
  categoryId: string,
  cursor: string | null,
  pageSize: number = 10
) => {
  // Add owner and repo to the variables object
  const variables = { first: pageSize, after: cursor, categoryId, owner, repo };

  const data = await client.request<{
    repository: {
      discussions: {
        pageInfo: {
          endCursor: string;
          hasNextPage: boolean;
        };
        nodes: { id: string; title: string, number: number }[];
      };
    };
  }>(GET_DISCUSSIONS_QUERY, variables);

  return data.repository.discussions;
};

/**
 * Fetches the IDs of the repository and the relevant discussion categories.
 * @returns IDs of the repository and the relevant discussion categories
 */
export const getRepositoryIds = async (): Promise<RepositoryIds> => {
  const variables = { owner, name: repo };

  const data = await client.request<{
    repository: {
      id: string;
      discussionCategories: { nodes: { id: string; name: string }[] };
    };
  }>(GET_REPO_IDS_QUERY, variables);

  const repositoryId = data.repository.id;
  let solutionImplementationCategoryId = "";
  let patternCategoryId = "";

  for (const category of data.repository.discussionCategories.nodes) {
    if (category.name === "Solution Implementations") {
      solutionImplementationCategoryId = category.id;
    } else if (category.name === "Patterns") {
      patternCategoryId = category.id;
    }
  }

  if (!solutionImplementationCategoryId || !patternCategoryId) {
    throw new Error("One or more discussion categories not found");
  }

  return { repositoryId, patternCategoryId, solutionImplementationCategoryId };
};

/**
 * Mutation to create a new discussion.
 * Used when creating new patterns or solution implementations.
 * @param title 
 * @param body 
 * @param categoryId 
 * @param repositoryId 
 * @returns 
 */
export const createDiscussion = async (
  title: string,
  body: string,
  categoryId: string,
  repositoryId: string
) => {
  const mutation = CREATE_DISCUSSION_MUTATION;

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

/**
 * Mutation to update the body of a discussion.
 * Used when editing patterns or solution implementations.
 * @param discussionId 
 * @param newBody 
 * @returns 
 */
export const updateDiscussionBody = async (
  discussionId: string,
  newBody: string
) => {
  const mutation = UPDATE_DISCUSSION_MUTATION;

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

/**
 * Given a discussion ID, fetches the corresponding discussion details from GitHub.
 * This method is used when navigating to the detail view of a pattern or solution implementation.
 * For loading the pattern - solution implementation links a different method is used as additional comments are needed.
 * @param discussionId
 * @returns 
 */
export const getDiscussionDetails = async (discussionNumber: number, isMappingDiscussion: boolean = false) => {
  let query = "";
  if (!isMappingDiscussion) {
    query = GET_SIMPLE_DISCUSSION_BY_NUMBER_QUERY;
  } else {
    query = GET_MAPPING_DISCUSSION_BY_NUMBER_QUERY;
  }

  // 💡 Die Variablen müssen mit den Variablennamen im GraphQL-Query übereinstimmen
  const variables = {
    discussionNumber,
    repoOwner: owner,
    repoName: repo
  };

  const data = await client.request<{ repository: { discussion: BaseDiscussion } }>(query, variables);
  return data.repository.discussion;
};

/**
 * Creates a comment with given text (body) for a given discussion.
 * Used to comment on mapping discussions
 * @param discussionId 
 * @param body 
 * @returns 
 */
export const createDiscussionComment = async (discussionId: string, body: string) => {
  const mutation = ADD_DISCUSSION_COMMENT;

  const variables = {
    discussionId,
    body
  };

  const response = await client.request<{ addDiscussionComment: { comment: Comment } }>(mutation, variables);

  return response.addDiscussionComment.comment;
}