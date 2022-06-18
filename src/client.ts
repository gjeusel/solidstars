import ld from "lodash";
import { z } from "zod";
import { Octokit } from "octokit";

const octokit = new Octokit({
  baseUrl: "https://api.github.com",
  auth: import.meta.env.VITE_ACCESS_TOKEN,
});

octokit.hook.wrap("request", async (request, options) => {
  const start = Date.now();
  try {
    const response = await request(options);

    const timedelta = Date.now() - start;

    const label = "[Oktokit] " + options.method + " " + options.url;
    if (options.url === "/graphql") {
      const vars = options.variables as any;
      const repo = `${vars.owner}/${vars.name}`;
      const td_seconds = (timedelta / 1000).toFixed(2);
      const msg = `${label} - stars for '${repo}' took ${td_seconds} s`;
      console.info(msg);
    }
    return response;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
});

const dateSchema = z.preprocess((arg: unknown) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());

export const StarsInfo = z.object({
  repo: z.string(),
  total: z.number(),
  stars: z.array(
    z.object({
      starredAt: dateSchema,
      name: z.string().nullable(), // Can be null, maybe some users concerned with privacy ?
    })
  ),
});
export type StarsInfo = z.infer<typeof StarsInfo>;

export async function fetchStars(repo: string) {
  const [owner, name] = repo.split("/");

  // https://docs.github.com/en/graphql/reference/objects#stargazerconnection
  const response = await octokit.graphql<any>(
    `
    query stars($owner: String!, $name: String!, $num: Int = 100) {
      repository(owner: $owner, name: $name) {
        stargazers(first: $num) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            name
          }
          edges {
            starredAt
          }
        }
      }
    }
    `,
    { owner, name }
  );

  const data = response.repository.stargazers;

  return StarsInfo.parse({
    repo,
    total: data.totalCount,
    stars: ld.zipWith(data.edges, data.nodes, (edge: any, node: any) => ({
      starredAt: edge.starredAt,
      name: node.name,
    })),
  });
}
