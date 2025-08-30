// this file contains types related to discussions, patterns, and solution implementations and pattern-solution implementation links

import { BaseDiscussion } from "./GitHub";
import { Reaction, Comment } from "./GitHub";

export interface Pattern extends BaseDiscussion {
  icon: string;
  description: string;
  patternRef: string;
  mappings: number[];
}

export interface SolutionImplementation extends BaseDiscussion {
  solutionRefUrl: string;
  description: string;
  mappings: number[];
}

export interface PatternSolutionMapping extends BaseDiscussion {
  patternDiscussionNumber: number;
  solutionImplementationDiscussionNumber: number;
};

export type DiscussionData = {
  patterns: {
    details: Pattern[];
    // Cache for the list data, indexed by the 'endCursor' of the previous page.
    // The first entry is stored under the key 'null'.
    listData: {
      [cursor: string]: {
        discussions: { id: string; title: string, number: number }[];
        pageInfo: {
          endCursor: string;
          hasNextPage: boolean;
        };
      };
    };
    currentPageCursor: string | null;
  };
  solutionImplementations: {
    details: SolutionImplementation[];
    listData: {
      [cursor: string]: {
        discussions: { id: string; title: string, number: number }[];
        pageInfo: {
          endCursor: string;
          hasNextPage: boolean;
        };
      };
    };
    currentPageCursor: string | null;
  };
  patternSolutionMappings: PatternSolutionMapping[];
};

export type RepositoryIds = {
  repositoryId: string;
  solutionImplementationCategoryId: string;
  patternCategoryId: string;
};

// not used for now but keep it because of the comments and reactions
/* export type DiscussionData = {
  patterns: Pattern[];
  solutions: Solution[];
  discussionCategories: DiscussionCategories[];
};

export type DiscussionCategories = {
  name: string;
  emojiHTML: string;
  categoryId: string;
  type: string;
}; */
