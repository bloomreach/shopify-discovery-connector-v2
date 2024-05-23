import type { DisplayableError } from "~/types/admin.types";

class GraphQLError extends Error {
  constructor(public readonly errors: DisplayableError[]) {
    super(errors.map((error) => error.message).join('\n'));
  }
}

export { GraphQLError };
