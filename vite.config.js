import { resolve } from "path";
import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserPage = repositoryName.endsWith(".github.io");

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repositoryName && !isUserPage ? `/${repositoryName}/` : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "case-study-1": resolve(__dirname, "case-studies/project-one.html"),
        "case-study-2": resolve(__dirname, "case-studies/project-two.html"),
        "case-study-3": resolve(__dirname, "case-studies/project-three.html"),
        "case-study-4": resolve(__dirname, "case-studies/project-four.html"),
        "case-study-5": resolve(__dirname, "case-studies/project-five.html"),
      },
    },
  },
});
