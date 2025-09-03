import { createDiscussion } from "./githubQueries";
import { PatternSolutionMapping, Pattern, SolutionImplementation } from "../types/DiscussionData";
import { addPatternMapping } from "./githubSolutions";
import { addSolutionImplementationMapping } from "./githubPatterns";

export async function createMapping({
    repositoryId,
    categoryId,
    title,
    patternDiscussion,
    solutionImplementationDiscussion
}: {
    repositoryId: string;
    categoryId: string;
    title: string;
    patternDiscussion: Pattern;
    solutionImplementationDiscussion: SolutionImplementation;
}) {
    const body = `
# Pattern
#${patternDiscussion.number}

# Solution Implementation
#${solutionImplementationDiscussion.number}
  `.trim();

    const response = await createDiscussion(title, body, categoryId, repositoryId);
    if (!response) {
        throw new Error("Failed to create pattern discussion");
    }

    // Create a Mapping object
    const mapping: PatternSolutionMapping = {
        ...response,
        patternDiscussionNumber: patternDiscussion.number,
        solutionImplementationDiscussionNumber: solutionImplementationDiscussion.number
    };

    const updatedPattern: Pattern = await addSolutionImplementationMapping({ patternDiscussion, mappingNumber: response.number });

    const updatedSolutionImplementation: SolutionImplementation = await addPatternMapping({ solutionImplementationDiscussion, mappingNumber: response.number });

    return {
        mapping,
        updatedPattern,
        updatedSolutionImplementation
    };
}

