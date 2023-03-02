import { InMemoryCache } from '@apollo/client';

const apolloCache = new InMemoryCache({
  typePolicies: {
    Project: { keyFields: ["id"] },
    Query: {
      fields: {
        projects: {
          keyArgs: ["userId"],

          read(existing, {canRead}) {
            if (!existing) return;

            let edges = existing.edges.filter((edge) => canRead(edge.node));
            const pageInfo = existing.pageInfo;

            const startIndex = edges.findIndex((edge) => edge.cursor === pageInfo?.startCursor);
            if (startIndex > -1) edges = edges.slice(startIndex);

            const endIndex = edges.findIndex((edge) => edge.cursor === pageInfo?.endCursor);
            if (endIndex > -1) edges = edges.slice(0, endIndex + 1);

            return { ...existing, edges };
          },

          merge(existing = makeEmptyData(), incoming) {
            const startCursor = incoming?.pageInfo?.startCursor;
            const endCursor = incoming?.pageInfo?.endCursor;

            let prefix: typeof existing.edges = [];
            let suffix: typeof existing.edges = [];

            // Find prefix
            if (startCursor) {
              const index = existing.edges.findIndex((edge) => edge.cursor === startCursor);
              prefix = index > -1 ? existing.edges.slice(0, index) : existing.edges;
            }

            // Find suffix
            if (endCursor) {
              const index = existing.edges.findIndex((edge) => edge.cursor === endCursor);
              suffix = index > -1 ? existing.edges.slice(index + 1) : [];
            }

            const edges = [...prefix, ...incoming.edges, ...suffix];

            // Modify the edges ONLY.
            return { ...incoming, edges };
          },
        },
      },
    },
  },
});

function makeEmptyData() {
  return {
    edges: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

export default apolloCache
