import { createDiscussion } from "./githubQueries";
import { Pattern } from "../types/DiscussionData";

export async function createPattern({
  repositoryId,
  categoryId,
  title,
  description,
  referenceUrl,
  iconUrl,
}: {
  repositoryId: string;
  categoryId: string;
  title: string;
  description: string;
  referenceUrl: string;
  iconUrl?: string;
}) {
  const body = `
${iconUrl ? `![Alt-Text](${iconUrl})\n\n` : ""}
# Description
${description}

# Pattern Reference
[${title}](${referenceUrl})

# Solution Implementations
  `.trim();

  const response = await createDiscussion(title, body, categoryId, repositoryId);
  if (!response) {
    throw new Error("Failed to create pattern discussion");
  }

  // Create a Pattern object to return
  const pattern: Pattern = {
    ...response,
    title,
    description,
    patternRef: referenceUrl,
    icon: iconUrl || "",
    mappings: []
  };

  return pattern;
}
