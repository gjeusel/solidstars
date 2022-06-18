import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  plugins: [
    solidPlugin(),
    AutoImport({
      dts: "src/auto-imports.d.ts",
      resolvers: [
        IconsResolver({
          prefix: "Icon",
          extension: "jsx",
        }),
      ],
    }),
    Icons({ autoInstall: true, compiler: "solid" }),
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
  resolve: {
    alias: {
      "node-fetch": "isomorphic-fetch",
    },
  },
});
