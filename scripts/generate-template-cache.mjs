import fs from "node:fs/promises";
import path from "node:path";

const templatePaths = {
  REACT: "starters-main/starters-main/react-ts",
  NEXTJS: "starters-main/starters-main/nextjs",
  EXPRESS: "starters-main/starters-main/express-simple",
  VUE: "starters-main/starters-main/vue",
  HONO: "starters-main/starters-main/hono-nodejs-starter",
  ANGULAR: "starters-main/starters-main/angular",
};

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, "generated");
const outputFile = path.join(outputDir, "template-cache.json");

async function main() {
  const cache = {};

  for (const [key, relativePath] of Object.entries(templatePaths)) {
    const inputPath = path.join(projectRoot, relativePath);
    const structure = await scanTemplateDirectory(inputPath);
    cache[key] = structure;
  }

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(cache), "utf8");
  console.log(`Template cache generated at ${outputFile}`);
}

async function scanTemplateDirectory(templatePath) {
  const folderName = path.basename(templatePath);
  return processDirectory(folderName, templatePath);
}

async function processDirectory(folderName, folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    const entryName = entry.name;
    const entryPath = path.join(folderPath, entryName);

    if (entry.isDirectory()) {
      if (
        [
          "node_modules",
          ".git",
          ".vscode",
          ".idea",
          "dist",
          "build",
          "coverage",
        ].includes(entryName)
      ) {
        continue;
      }
      items.push(await processDirectory(entryName, entryPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (
      [
        "package-lock.json",
        "yarn.lock",
        ".DS_Store",
        "thumbs.db",
        ".gitignore",
        ".npmrc",
        ".yarnrc",
        ".env",
        ".env.local",
        ".env.development",
        ".env.production",
      ].includes(entryName)
    ) {
      continue;
    }

    const parsedPath = path.parse(entryName);
    const content = await fs.readFile(entryPath, "utf8");

    items.push({
      filename: parsedPath.name,
      fileExtension: parsedPath.ext.replace(/^\./, ""),
      content,
    });
  }

  return { folderName, items };
}

main().catch((error) => {
  console.error("Failed to generate template cache", error);
  process.exit(1);
});
