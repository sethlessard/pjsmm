import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "@wessberg/rollup-plugin-ts";
import shebang from "rollup-plugin-add-shebang";
import pkg from "./package.json";

const extensions = [
  ".ts",
  ".js"
];

export default {
  input: "./src/presentation/index.ts",
  external: [],
  plugins: [
    nodeResolve({ extensions }),
    ts({
      tsconfig: "tsconfig.json"
      
    }),
    shebang({
      include: pkg.main
    }),
  ],
  output: [{
    file: pkg.main,
    format: "cjs"
  }]
};
