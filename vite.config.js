import { resolve } from "path";
import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserPage = repositoryName.endsWith(".github.io");

const cssBeforeJs = () => ({
  name: "css-before-js",
  transformIndexHtml: {
    order: "post",
    handler(html) {
      const cssLink = html.match(
        /<link rel="stylesheet" crossorigin href="\/assets\/[^"]+\.css">/
      )?.[0];
      const jsScript = html.match(
        /<script type="module" crossorigin src="\/assets\/[^"]+\.js"><\/script>/
      )?.[0];

      if (!cssLink || !jsScript || html.indexOf(cssLink) < html.indexOf(jsScript)) {
        return html;
      }

      return html.replace(cssLink, "").replace(jsScript, `${cssLink}\n    ${jsScript}`);
    },
  },
});

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repositoryName && !isUserPage ? `/${repositoryName}/` : "/",
  plugins: [cssBeforeJs()],
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
