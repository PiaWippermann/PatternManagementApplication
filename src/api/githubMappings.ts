import { createDiscussion } from "./githubQueries";
import { PatternSolutionMapping } from "../types/DiscussionData";

export async function createMapping({
    repositoryId,
    categoryId,
    title,
    patternNumber,
    solutionImplementationNumber
}: {
    repositoryId: string;
    categoryId: string;
    title: string;
    patternNumber: number;
    solutionImplementationNumber: number;
}) {
    const body = `
# Pattern
${patternNumber}

# Solution Implementation
${solutionImplementationNumber}
  `.trim();

    const response = await createDiscussion(title, body, categoryId, repositoryId);
    if (!response) {
        throw new Error("Failed to create pattern discussion");
    }

    // Create a Mapping object to return
    const mapping: PatternSolutionMapping = {
        ...response,
        patternDiscussionNumber: patternNumber,
        solutionImplementationDiscussionNumber: solutionImplementationNumber
    };

    return mapping;
}

