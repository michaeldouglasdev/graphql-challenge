import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers";
import { readFileSync } from "fs";
import { parse } from "graphql";

async function bootstrap() {
  const typeDefs = parse(
    readFileSync("./src/schema.graphql", { encoding: "utf-8" })
  );

  const server = new ApolloServer({
    resolvers: resolvers,
    typeDefs,
    persistedQueries: {
      ttl: null,
    },
  });

  const { url } = await startStandaloneServer(server);
  console.log(`GraphQL server is running on ${url}`);
}

bootstrap();
