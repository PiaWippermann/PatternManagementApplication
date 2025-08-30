import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getRepositoryIds, getDiscussionsListData, getDiscussionDetails } from "../api/githubQueries";
import {
  DiscussionData,
  RepositoryIds,
  Pattern,
  SolutionImplementation,
  PatternSolutionMapping
} from "../types/DiscussionData";
import {
  BaseDiscussion
} from "../types/GitHub";

// Define the shape of the context
type DiscussionDataContextType = {
  discussionData: DiscussionData;
  fetchDiscussionList: (categoryId: string, cursor: string | null) => Promise<void>;
  fetchDiscussionDetailsByNumber: (categoryId: string, discussionNumber: number) => Promise<Pattern | SolutionImplementation | undefined>;
  fetchMappingDiscussionByNumber: (discussionNumber: number) => Promise<BaseDiscussion | undefined>;
  ids: RepositoryIds;
  loading: boolean;
  error: string | null;
};

// Create the context with default values
const DiscussionDataContext = createContext<DiscussionDataContextType>({
  discussionData: {
    patterns: {
      details: [],
      listData: {},
      currentPageCursor: null,
    },
    solutionImplementations: {
      details: [],
      listData: {},
      currentPageCursor: null,
    },
    patternSolutionMappings: [],
  },
  fetchDiscussionList: async () => { },
  fetchDiscussionDetailsByNumber: async () => { return undefined; },
  fetchMappingDiscussionByNumber: async () => { return undefined },
  ids: {
    repositoryId: "",
    solutionImplementationCategoryId: "",
    patternCategoryId: "",
  },
  loading: true,
  error: null,
});

// Define constants for pagination and category IDs
const PAGE_SIZE = 1; // Number of items per page

// Custom hook to use the DiscussionDataContext
export const useDiscussionData = () => useContext(DiscussionDataContext);

// Provider component to wrap the app and provide the context
export const DiscussionDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [discussionData, setDiscussionData] = useState<DiscussionData>({
    patterns: {
      details: [],
      listData: {},
      currentPageCursor: null,
    },
    solutionImplementations: {
      details: [],
      listData: {},
      currentPageCursor: null,
    },
    patternSolutionMappings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ids, setIds] = useState<RepositoryIds>({
    repositoryId: "",
    solutionImplementationCategoryId: "",
    patternCategoryId: "",
  });

  // Dynamic fetching of discussions (overview) with pagination
  // The `cursor` parameter is now a string or null.
  const fetchDiscussionList = useCallback(async (categoryId: string, cursor: string | null) => {
    const type = categoryId === ids?.patternCategoryId ? 'patterns' : 'solutionImplementations';

    // Check if the request has already been made using the cursor as the key
    if (discussionData?.[type].listData[cursor || 'null']) {
      console.log(`Data for ${type} with cursor ${cursor} already loaded.`);
      // Update the currentPageCursor to the requested cursor
      setDiscussionData(prevData => {
        return {
          ...prevData,
          [type]: {
            ...prevData[type],
            currentPageCursor: cursor,
          },
        };
      });
      return;
    }

    // Data needs to be fetched from GitHub
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await getDiscussionsListData(categoryId, cursor, PAGE_SIZE);

      setDiscussionData(prevData => {
        // Use a temporary key for the first page to store it in the object
        // for consistency, since null cannot be a key in a JS object.
        const key = cursor || 'null';

        return {
          ...prevData,
          [type]: {
            ...prevData[type],
            listData: {
              ...prevData[type].listData,
              [key]: {
                discussions: response.nodes,
                pageInfo: response.pageInfo,
              },
            },
            currentPageCursor: cursor,
          },
        };
      });
    } catch (err: any) {
      setError(err.message || "Data could not be loaded.");
      console.error(`Error loading ${type}:`, err);
    } finally {
      setLoading(false);
    }
  }, [ids, discussionData]);

  // Function to fetch details of a specific discussion by its ID
  // This is used when navigating to the detail view of a pattern or solution implementation
  // It first checks the cache, and if not found, fetches from GitHub
  const fetchDiscussionDetailsByNumber = useCallback(async (categoryId: string, discussionNumber: number) => {
    const type = categoryId === ids?.patternCategoryId ? 'patterns' : 'solutionImplementations';
    let cachedDetails: any;

    if (type == "patterns") {
      cachedDetails = discussionData?.patterns.details.find(d => d.number === discussionNumber);
    } else if (type == "solutionImplementations") {
      cachedDetails = discussionData?.solutionImplementations.details.find(d => d.number === discussionNumber);
    }

    if (cachedDetails) {
      console.log(`Details for discussion ${discussionNumber} already loaded from cache.`);
      // return the found details
      return cachedDetails;
    }

    // 2. Load the data if not in cache
    setLoading(true);
    setError(null);

    try {
      const response = await getDiscussionDetails(discussionNumber);

      if (!response) {
        setError("Discussion not found.");
        return;
      }
      // Based on the type the response body needs to be parsed and the details stored in the correct array
      if (type === "patterns") {
        const patternData = parsePatternBody(response.body);
        const fullPatternData: Pattern = {
          ...response,
          icon: patternData.icon || "",
          description: patternData.description || "",
          patternRef: patternData.patternRef || "",
          mappings: patternData.mappings || [],
        };

        setDiscussionData(prevData => ({
          ...prevData,
          patterns: {
            ...prevData.patterns,
            details: [...prevData.patterns.details, fullPatternData],
          },
        }));

        return fullPatternData;
      } else if (type === "solutionImplementations") {
        console.log("Parsing solution body for discussion number", discussionNumber);
        console.log(response.body);
        const solutionData = parseSolutionBody(response.body);
        const fullSolutionData: SolutionImplementation = {
          ...response,
          solutionRefUrl: solutionData.solutionRefUrl || "",
          description: solutionData.description || "",
          mappings: solutionData.mappings || [],
        };

        setDiscussionData(prevData => ({
          ...prevData,
          solutionImplementations: {
            ...prevData.solutionImplementations,
            details: [...prevData.solutionImplementations.details, fullSolutionData],
          },
        }));

        return fullSolutionData;
      }
    } catch (err: any) {
      setError(err.message || "Details could not be loaded.");
      console.error(`Error loading details for ${discussionNumber}:`, err);
    } finally {
      setLoading(false);
    }
  }, [discussionData]);

  const fetchMappingDiscussionByNumber = useCallback(async (discussionNumber: number) => {
    // Check if the patternSolutionMapping is already cached
    const cachedDetails = discussionData?.patternSolutionMappings.find(d => d.number == discussionNumber);
    if (cachedDetails) {
      console.log("Mapping discussion found in cache")
      return cachedDetails;
    }

    // Load the discussion from the GitHub GraphQL API if it is not in the cache
    setLoading(true);
    setError(null);

    try {
      const response = await getDiscussionDetails(discussionNumber, true);
      console.log("response for mapping discussion", response);

      if (!response) {
        setError("Discussion not found.");
        return;
      }

      const mappingData = parseMappingBody(response.body);

      if (!mappingData.patternDiscussionNumber || !mappingData.solutionImplementationDiscussionNumber) {
        // Mapping discussion body is not in the right format, ignore this discussion
        return;
      }

      console.log("parsed mapping body", mappingData);

      const fullMappingData: PatternSolutionMapping = {
        ...response,
        patternDiscussionNumber: parseInt(mappingData.patternDiscussionNumber),
        solutionImplementationDiscussionNumber: parseInt(mappingData.solutionImplementationDiscussionNumber)
      };

      setDiscussionData(prevData => ({
        ...prevData,
        patternSolutionMappings: [
          ...prevData.patternSolutionMappings,
          fullMappingData
        ],
      }));

      return fullMappingData;
    } catch (err: any) {
      setError(err.message || "Mapping discussion could not be loaded.");
      console.error(`Error loading details for ${discussionNumber}:`, err);
    } finally {
      setLoading(false);
    }
  }, [discussionData]);

  // Function to fetch repository IDs
  // Called when the component mounts for the first time
  const fetchRepoIds = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const repoId = await getRepositoryIds();
      setIds(repoId);

    } catch (err: any) {
      console.error("Error when loading repository ids:", err);
      setError(err.message || "Repository ids could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch repo ids on mount
  useEffect(() => {
    fetchRepoIds();
  }, []);

  return (
    <DiscussionDataContext.Provider
      value={{
        ids, loading, error, discussionData, fetchDiscussionList, fetchDiscussionDetailsByNumber, fetchMappingDiscussionByNumber
      }}
    >
      {children}
    </DiscussionDataContext.Provider>
  );
};

/**
 * Parses the body of a pattern - solution implementation - mapping discussion to extract the pattern and solution implementation number.
 * @param body 
 */
function parseMappingBody(body: string): {
  patternDiscussionNumber: string,
  solutionImplementationDiscussionNumber: string
} {
  // 💡 Korrigierter Regex: Sucht nach "# Pattern" und ignoriert alle Zeichen bis zur nächsten Überschrift
  // Die Gruppe (\d+) fängt die Nummer ein.
  const patternRegex = /#\s*Pattern[\s\S]*?#(\d+)/;

  // 💡 Korrigierter Regex: Sucht nach "# Solution Implementation" und ignoriert alle Zeichen bis zur nächsten Überschrift
  // Die Gruppe (\d+) fängt die Nummer ein.
  const solutionImplementationRegex = /#\s*Solution\s*Implementation[\s\S]*?#(\d+)/;

  const patternMatch = body.match(patternRegex);
  const solutionImplementationMatch = body.match(solutionImplementationRegex);

  return {
    patternDiscussionNumber: patternMatch ? patternMatch[1].trim() : "",
    solutionImplementationDiscussionNumber: solutionImplementationMatch ? solutionImplementationMatch[1].trim() : "",
  }
}

/**
 * Parses the body of a pattern discussion to extract the icon URL, description, and pattern reference URL.
 * 
 * @param body - body of the discussion
 * @returns 
 */
function parsePatternBody(body: string): {
  icon: string | null;
  description: string | null;
  patternRef: string | null;
  mappings: number[] | [];
} {
  const iconRegex = /!\[.*?\]\((.*?)\)/;
  const descriptionRegex = /# Description\s+([\s\S]*?)\n\s*#/;
  const patternRefRegex = /\[.*?\]\((https?:\/\/[^\s)]+)\)/;

  const mappingsMatch = body.match(
    /# Solution Implementations\s*((?:.|\n)*?)(?=\n# |\n*$)/
  );
  let mappingsMatches: number[] = [];

  if (mappingsMatch) {
    const sectionText = mappingsMatch[1];
    mappingsMatches = [...sectionText.matchAll(/#(\d+)/g)].map((m) =>
      Number(m[1])
    );
  }
  const iconMatch = body.match(iconRegex);
  const descriptionMatch = body.match(descriptionRegex);
  const patternRefMatch = body.match(patternRefRegex);

  return {
    icon: iconMatch ? iconMatch[1].trim() : null,
    description: descriptionMatch ? descriptionMatch[1].trim() : null,
    patternRef: patternRefMatch ? patternRefMatch[1].trim() : null,
    mappings: mappingsMatches,
  };
}

/**
 * Parses the body of a solution discussion to extract the solution reference URL, description, and linked pattern numbers.
 * @param body - body of the discussion
 * @returns 
 */
function parseSolutionBody(body: string): {
  solutionRefUrl: string | null;
  description: string | null;
  mappings: number[] | [];
} {
  const solutionRefRegex = /\[.*?\]\((https?:\/\/[^\s)]+)\)/; // Regex to match the solution reference URL
  const descriptionRegex = /# Description\s+([\s\S]*?)\n\s*#/;

  const patternLinksMatch = body.match(
    /# Patterns\s*((?:.|\n)*?)(?=\n# |\n*$)/
  );
  let patternLinkMatches: number[] = [];

  if (patternLinksMatch) {
    const sectionText = patternLinksMatch[1];
    patternLinkMatches = [...sectionText.matchAll(/#(\d+)/g)].map((m) =>
      Number(m[1])
    );
  }

  const solutionRefMatch = body.match(solutionRefRegex);
  const descriptionMatch = body.match(descriptionRegex);

  return {
    solutionRefUrl: solutionRefMatch ? solutionRefMatch[1].trim() : null,
    description: descriptionMatch ? descriptionMatch[1].trim() : null,
    mappings: patternLinkMatches,
  };
}

/* function splitDiscussionData(discussions: BaseDiscussion[]): DiscussionData {
  const patterns: Pattern[] = [];
  const solutions: Solution[] = [];
  const discussionCategories: DiscussionCategories[] = [];

  // map to group discussions by category
  const categoryMap = new Map<string, BaseDiscussion[]>();

  // Phase 1: Populate categoryMap and initialize discussionCategories
  for (const discussion of discussions) {
    const category = discussion.category;
    if (!category?.name) continue;

    if (!categoryMap.has(category.name)) {
      categoryMap.set(category.name, []);
      discussionCategories.push({
        name: category.name,
        emojiHTML: category.emojiHTML,
        categoryId: category.id,
        type: "Realizations", // Default type
      });
    }
    categoryMap.get(category.name)!.push(discussion);
  }

  // Phase 2: Process categories and populate patterns/solutions
  for (const [categoryName, items] of categoryMap.entries()) {
    if (categoryName === "Patterns") {
      // Update the type for the "Patterns" category
      const patternCategory = discussionCategories.find(
        (cat) => cat.name === "Patterns"
      );
      if (patternCategory) {
        patternCategory.type = "Patterns";
      }

      // Process "Patterns" discussions
      for (const item of items) {
        const patternData = parsePatternBody(item.body);
        patterns.push({
          id: item.id,
          number: item.number,
          title: item.title,
          url: item.url,
          body: item.body,
          category: item.category,
          createdAt: item.createdAt,
          viewerCanUpdate: item.viewerCanUpdate,
          viewerCanDelete: item.viewerCanDelete,
          author: item.author,
          comments: item.comments,
          reactions: item.reactions,
          icon: patternData.icon || "",
          description: patternData.description || "",
          patternRef: patternData.patternRef || "",
        });
      }
    } else {
      // Process "Realizations" (other categories)
      for (const item of items) {
        const solutionData = parseSolutionBody(item.body);
        solutions.push({
          id: item.id,
          number: item.number,
          title: item.title,
          url: item.url,
          body: item.body,
          category: item.category,
          createdAt: item.createdAt,
          viewerCanUpdate: item.viewerCanUpdate,
          viewerCanDelete: item.viewerCanDelete,
          author: item.author,
          description: solutionData.description || "",
          solutionRefUrl: solutionData.solutionRefUrl || "",
          comments: item.comments,
          reactions: item.reactions,
          linkedPatterns: solutionData.linkedPatterns,
        });
      }
    }
  }

  console.log("Patterns found:", patterns);
  console.log("Solutions found:", solutions);

  return {
    patterns,
    solutions,
    discussionCategories,
  };
}
 */