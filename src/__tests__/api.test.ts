import { ApolloServer } from "@apollo/server";
import { resolvers } from "../resolvers";
import { readFileSync } from "fs";
import { GraphQLFormattedError, parse } from "graphql";
import { User } from "../__generated_types__";

const typeDefs = parse(
  readFileSync("./src/schema.graphql", { encoding: "utf-8" })
);

const createServer = () => {
  return new ApolloServer({
    resolvers,
    typeDefs,
  });
};

describe("GraphQL API Tests", () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = createServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("getUser Query", () => {
    it("should return a user when valid ID is provided", async () => {
      const query = `
        query GetUser($userId: ID!) {
          getUser(id: $userId) {
            id
            name
            email
            age
          }
        }
      `;

      const variables = {
        userId: "user-1",
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data).toBeDefined();
        expect(result.body.singleResult.data?.getUser).toEqual({
          id: "user-1",
          name: "Michael1",
          email: "michaeldouglasdev1@gmail.com",
          age: 28,
        });
      }
    });

    it("should return null when user ID does not exist", async () => {
      const query = `
        query GetUser($userId: ID!) {
          getUser(id: $userId) {
            id
            name
            email
            age
          }
        }
      `;

      const variables = {
        userId: "non-existent-user",
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.getUser).toBeNull();
      }
    });

    it("should handle missing required ID parameter", async () => {
      const query = `
        query GetUser {
          getUser {
            id
            name
            email
            age
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeDefined();
        const errors = result.body.singleResult
          .errors as GraphQLFormattedError[];
        expect(errors[0]?.message).toContain("required");
      }
    });
  });

  describe("listUsers Query", () => {
    it("should return all users when no limit is provided", async () => {
      const query = `
        query ListUsers {
          listUsers {
            id
            name
            email
            age
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        const users = result.body.singleResult.data?.listUsers as User[];
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(users).toHaveLength(10);
        expect(users[0]).toEqual({
          id: "user-1",
          name: "Michael1",
          email: "michaeldouglasdev1@gmail.com",
          age: 28,
        });
      }
    });

    it("should return limited number of users when limit is provided", async () => {
      const query = `
        query ListUsers($limit: Int) {
          listUsers(limit: $limit) {
            id
            name
            email
            age
          }
        }
      `;

      const variables = {
        limit: 3,
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.listUsers).toHaveLength(3);
      }
    });

    it("should return empty array when limit is 0", async () => {
      const query = `
        query ListUsers($limit: Int) {
          listUsers(limit: $limit) {
            id
            name
            email
            age
          }
        }
      `;

      const variables = {
        limit: 0,
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.listUsers).toHaveLength(0);
      }
    });

    it("should return all users when limit exceeds total count", async () => {
      const query = `
        query ListUsers($limit: Int) {
          listUsers(limit: $limit) {
            id
            name
            email
            age
          }
        }
      `;

      const variables = {
        limit: 100,
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.listUsers).toHaveLength(10);
      }
    });
  });

  describe("Performance Tests", () => {
    it("should resolve getUser query within 100ms", async () => {
      const query = `
        query GetUser($userId: ID!) {
          getUser(id: $userId) {
            id
            name
            email
            age
          }
        }
      `;

      const variables = {
        userId: "user-1",
      };

      const startTime = Date.now();
      const result = await server.executeOperation({
        query,
        variables,
      });
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.getUser).toBeDefined();
      }
    });

    it("should resolve listUsers query within 100ms", async () => {
      const query = `
        query ListUsers {
          listUsers {
            id
            name
            email
            age
          }
        }
      `;

      const startTime = Date.now();
      const result = await server.executeOperation({
        query,
      });
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeUndefined();
        expect(result.body.singleResult.data?.listUsers).toBeDefined();
      }
    });
  });

  describe("Security Tests", () => {
    it("should return error when querying non-existent field", async () => {
      const query = `
        query GetUser($userId: ID!) {
          getUser(id: $userId) {
            id
            name
            email
            age
            nonExistentField
          }
        }
      `;

      const variables = {
        userId: "user-1",
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeDefined();
        expect(result.body.singleResult.errors?.[0]?.message).toContain(
          "nonExistentField"
        );
      }
    });

    it("should return error when querying non-existent query", async () => {
      const query = `
        query NonExistentQuery {
          nonExistentQuery {
            id
          }
        }
      `;

      const result = await server.executeOperation({
        query,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeDefined();
        expect(result.body.singleResult.errors?.[0]?.message).toContain(
          "nonExistentQuery"
        );
      }
    });

    it("should return error for invalid query syntax", async () => {
      const query = `
        query GetUser($userId: ID!) {
          getUser(id: $userId) {
            id
            name
            email
            age
          }
        }
        invalid syntax here
      `;

      const variables = {
        userId: "user-1",
      };

      const result = await server.executeOperation({
        query,
        variables,
      });

      expect(result.body.kind).toBe("single");
      if (result.body.kind === "single") {
        expect(result.body.singleResult.errors).toBeDefined();
        expect(result.body.singleResult.errors?.[0]?.message).toContain(
          "Syntax Error"
        );
      }
    });
  });
});
