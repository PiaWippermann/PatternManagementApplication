// src/api/githubGraphql.ts
import { GraphQLClient, gql } from "graphql-request";

const token = import.meta.env.VITE_GITHUB_TOKEN;
const owner = import.meta.env.VITE_REPO_OWNER;
const repo = import.meta.env.VITE_REPO_NAME;

const endpoint = "https://api.github.com/graphql";

const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
