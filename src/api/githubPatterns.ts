import { createDiscussion } from "./githubQueries";

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
  `.trim();

  return createDiscussion(title, body, categoryId, repositoryId);
}
