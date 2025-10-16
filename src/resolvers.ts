import { Resolvers } from "./__generated_types__";
import { DATA } from "./data";

export const resolvers: Resolvers = {
  Query: {
    getUser: (_parent, args) => {
      const user = DATA.find((user) => user.id === args.id);

      return user;
    },
    listUsers: (_parent, args) => {
      const limit = args.limit ?? 10;
      if (limit <= 0) {
        return [];
      }
      return DATA.slice(0, limit);
    },
  },
};
