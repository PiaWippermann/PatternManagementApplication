import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadDiscussions, getRepositoryId } from "../api/githubQueries"; // Importiere die Funktion zum Laden der Daten
import {
  Pattern,
  Solution,
  DiscussionData,
  DiscussionCategories,
} from "../types/DiscussionData";
import { BaseDiscussion } from "../types/GitHub";
import providerUrlRegex from "../utils/providerUrlRegexMap.json";

type CategoryDataContextType = {
  data: DiscussionData | null;
  loading: boolean;
  error: string | null;
  repositoryId: string;
  refetchData: () => Promise<void>;
};

export const providerUrlRegexMap: Record<string, string> = providerUrlRegex;

const DiscussionDataContext = createContext<CategoryDataContextType>({
  data: null,
  loading: true,
  error: null,
  repositoryId: "",
  refetchData: async () => {},
});

export const useDiscussionData = () => useContext(DiscussionDataContext);

export const DiscussionDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repositoryId, setRepositoryId] = useState<string>("");

  const fetchAndSetData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const repoId = await getRepositoryId();
      setRepositoryId(repoId);

      const discussions = await loadDiscussions();
      const structured = splitDiscussionData(discussions);
      setData(structured);
    } catch (err: any) {
      // Type 'any' for error for flexibility, but consider more specific error types
      console.error("Fehler beim Laden oder Verarbeiten der Daten:", err);
      setError(err.message || "Daten konnten nicht geladen werden.");
      setData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetData();
  }, [fetchAndSetData]);

  const refetchData = useCallback(async () => {
    console.log("Refetching discussion data...");
    await fetchAndSetData();
  }, [fetchAndSetData]);

  return (
    <DiscussionDataContext.Provider
      value={{ data, loading, error, repositoryId, refetchData }}
    >
      {children}
    </DiscussionDataContext.Provider>
  );
};

function parsePatternBody(body: string): {
  icon: string | null;
  description: string | null;
  patternRef: string | null;
} {
  const iconRegex = /!\[.*?\]\((.*?)\)/;
  const descriptionRegex = /# Description\s+([\s\S]*?)\n\s*#/;
  const patternRefRegex = /\[.*?\]\((https?:\/\/[^\s)]+)\)/;

  const iconMatch = body.match(iconRegex);
  const descriptionMatch = body.match(descriptionRegex);
  const patternRefMatch = body.match(patternRefRegex);

  return {
    icon: iconMatch ? iconMatch[1].trim() : null,
    description: descriptionMatch ? descriptionMatch[1].trim() : null,
    patternRef: patternRefMatch ? patternRefMatch[1].trim() : null,
  };
}

function parseSolutionBody(body: string): {
  solutionRefUrl: string | null;
  description: string | null;
  linkedPatterns: number[] | [];
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
    linkedPatterns: patternLinkMatches,
  };
}

function splitDiscussionData(discussions: BaseDiscussion[]): DiscussionData {
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
