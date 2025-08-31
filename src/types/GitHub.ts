// this file contains types related to GitHub GraphQL API responses

export interface Author {
  login: string;
  avatarUrl: string;
}

export interface Reaction {
  content: string;
  user: {
    name: string;
    avatarUrl: string;
  };
}

export interface Comment {
  id: string;
  body: string;
  publishedAt: string;
  author: Author;
  reactions: {
    nodes: Reaction[];
  };
}

export interface DiscussionCategory {
  id: string;
  name: string;
  description: string;
  emojiHTML: string;
}

export type SimpleDiscussion = {
  id: string;
  number: number;
  title: string;
}

export interface BaseDiscussion {
  id: string;
  number: number;
  title: string;
  url: string;
  body: string;
  category: DiscussionCategory;
  createdAt: string;
  viewerCanUpdate: boolean;
  viewerCanDelete: boolean;
  author: Author;
  comments: {
    nodes: Comment[];
  };
  reactions: {
    nodes: Reaction[];
  };
}

export interface DiscussionsResponse {
  repository: {
    discussions: {
      nodes: BaseDiscussion[];
    };
  };
}

export interface DiscussionCreationResponse {
  createDiscussion: {
    discussion: BaseDiscussion;
  };
}

export interface DiscussionUpdateResponse {
  updateDiscussion: BaseDiscussion;
}
