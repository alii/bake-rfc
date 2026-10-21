// SKETCH. The boundary lives here. Bake has no directive and no word for "client component".
import type { Plugin } from "bun:bake";

// A file is live if it says "use client", or (the shop's rule) if it uses browser
// features. The second rule is unsound: it cannot see a custom hook in another file.
const LIVE = /^\s*["']use client|\buse(State|Effect|Reducer|Ref)\b|\son[A-Z]\w*=/m;

export default {
  name: "rsc-sketch",
  setup(build) {
    build.onLoad({ filter: /\.tsx$/ }, async args => {
      const source = await Bun.file(args.path).text();
      if (args.side !== "server" || !LIVE.test(source)) return { contents: source, loader: "tsx" };

      // The real code goes to the other copies. The server gets stubs that name it.
      const id = build.bake.addFile(args.path, "client");
      build.bake.addFile(args.path, "ssr");

      // `export *` is not followed here. See QUESTIONS.md.
      const { exports } = new Bun.Transpiler({ loader: "tsx" }).scan(source);
      const stubs = exports.map(name => {
        const stub = `reference(${JSON.stringify(id)}, ${JSON.stringify(name)})`;
        return name === "default" ? `export default ${stub};` : `export const ${name} = ${stub};`;
      });
      return { loader: "js", contents: `import { reference } from "rsc-sketch/stub";\n${stubs.join("\n")}` };
    });
  },
} satisfies Plugin;
