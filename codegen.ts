import { CodegenConfig } from "@graphql-codegen/cli";

const codegen: CodegenConfig = {
  schema: "./src/schema.graphql",
  generates: {
    "./src/__generated_types__/index.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        maybeValue: "T | undefined",
      },
    },
  },
};

export default codegen;
