import solid from "solid-start/vite";
import dotenv from "dotenv";
import { defineConfig } from "vite";

import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";

// @ts-expect-error no typing
import vercel from "solid-start-vercel";

export default defineConfig(() => {
  dotenv.config();
  return {
    plugins: [
      solid({ ssr: false, adapter: vercel({ edge: false }) }),
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
  };
});
