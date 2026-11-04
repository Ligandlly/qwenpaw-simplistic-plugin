import { build } from "esbuild";

// The plugin is pure side effects: it injects one style sheet and patches the
// approval preference read. `iife` (not `esm`) makes the artifact run whether
// the console loads it as a blob-URL module or as a classic script.
await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  outfile: "dist/index.js",
  legalComments: "none",
  minify: true,
  sourcemap: false,
  logLevel: "info",
});
