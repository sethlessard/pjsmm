import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
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
    babel({
      extensions,
      babelHelpers: "bundled",
      include: ["src/**/*"]
    })
  ],
  output: [{
    file: pkg.main,
    format: "cjs"
  }]
};
