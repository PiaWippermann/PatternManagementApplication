import { BaseDiscussion } from "./GitHub";
import { Reaction, Comment } from "./GitHub";

export interface Pattern extends BaseDiscussion {
  icon: string;
  description: string;
  patternRef: string;
}

export interface Solution extends BaseDiscussion {
  solutionRefUrl: string;
  description: string;
  linkedPatterns: number[];
}

// not used for now but keep it because of the comments and reactions
export type PatternSolutionLink = {
  patternUrl: string;
  solutionUrl: string;
  provider: string;
  comments: {
    nodes: Comment[];
  };
  reactions: {
    nodes: Reaction[];
  };
};

export type DiscussionData = {
  patterns: Pattern[];
  solutions: Solution[];
  discussionCategories: DiscussionCategories[];
};

export type DiscussionCategories = {
  name: string;
  emojiHTML: string;
  categoryId: string;
  type: string;
};
