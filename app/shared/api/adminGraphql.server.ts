export type AdminGraphql = {
  graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;
};

type GraphqlError = {
  message: string;
};

type GraphqlJson = {
  data?: unknown;
  errors?: GraphqlError[];
};

export const gql = async <T>(
  admin: AdminGraphql,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  const res = await admin.graphql(query, variables ? { variables } : undefined);
  const json = (await res.json()) as GraphqlJson;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }
  return json.data as T;
};
