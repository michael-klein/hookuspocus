import { terser } from "rollup-plugin-terser";
export default [
  {
    input: "src/index.mjs",
    output: [
      {
        file: "dist/hooked.js",
        name: "hooked",
        format: "umd",
        sourcemap: true
      },
      {
        file: "dist/hooked.mjs",
        format: "esm",
        sourcemap: true
      }
    ]
  },
  {
    input: "src/index.mjs",
    plugins: [terser({ sourcemap: true })],
    output: [
      {
        file: "dist/hooked.min.js",
        name: "funcyjs",
        format: "umd",
        sourcemap: true
      },
      {
        file: "dist/hooked.min.mjs",
        format: "esm",
        sourcemap: true
      }
    ]
  }
];
