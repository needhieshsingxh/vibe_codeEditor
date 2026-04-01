import { scanTemplateDirectory } from "@/modules/playground/lib/path-to-json";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import templateCache from "@/generated/template-cache.json";
import path from "path";
import { NextRequest } from "next/server";

const fallbackTemplates: Record<string, TemplateFolder> = {
  REACT: {
    folderName: "Root",
    items: [
      {
        filename: "package",
        fileExtension: "json",
        content:
          '{\n  "name": "react-fallback",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "start": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  },\n  "devDependencies": {\n    "vite": "^7.0.0"\n  }\n}',
      },
      {
        filename: "index",
        fileExtension: "html",
        content:
          '<!doctype html>\n<html>\n  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>React Fallback</title></head>\n  <body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body>\n</html>\n',
      },
      {
        folderName: "src",
        items: [
          {
            filename: "main",
            fileExtension: "jsx",
            content:
              'import React from "react";\nimport ReactDOM from "react-dom/client";\n\nReactDOM.createRoot(document.getElementById("root")).render(<h1>Hello React</h1>);\n',
          },
        ],
      },
    ],
  },
  NEXTJS: {
    folderName: "Root",
    items: [
      {
        filename: "package",
        fileExtension: "json",
        content:
          '{\n  "name": "nextjs-fallback",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "start": "next dev",\n    "build": "next build"\n  },\n  "dependencies": {\n    "next": "16.1.6",\n    "react": "19.2.3",\n    "react-dom": "19.2.3"\n  }\n}',
      },
      {
        folderName: "app",
        items: [
          {
            filename: "page",
            fileExtension: "tsx",
            content:
              "export default function Page() { return <h1>Hello Next.js</h1>; }\n",
          },
        ],
      },
    ],
  },
  EXPRESS: {
    folderName: "Root",
    items: [
      {
        filename: "package",
        fileExtension: "json",
        content:
          '{\n  "name": "express-fallback",\n  "private": true,\n  "scripts": {\n    "dev": "node index.js",\n    "start": "node index.js"\n  },\n  "dependencies": {\n    "express": "^4.21.2"\n  }\n}',
      },
      {
        filename: "index",
        fileExtension: "js",
        content:
          'const express = require("express");\nconst app = express();\napp.get("/", (_req, res) => res.send("Hello Express"));\napp.listen(3000);\n',
      },
    ],
  },
  VUE: {
    folderName: "Root",
    items: [
      {
        filename: "package",
        fileExtension: "json",
        content:
          '{\n  "name": "vue-fallback",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "start": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "vue": "^3.5.0"\n  },\n  "devDependencies": {\n    "vite": "^7.0.0",\n    "@vitejs/plugin-vue": "^6.0.0"\n  }\n}',
      },
      {
        filename: "index",
        fileExtension: "html",
        content:
          '<!doctype html>\n<html>\n  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Vue Fallback</title></head>\n  <body><div id="app"></div><script type="module" src="/src/main.js"></script></body>\n</html>\n',
      },
      {
        filename: "vite.config",
        fileExtension: "js",
        content:
          'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\n\nexport default defineConfig({ plugins: [vue()] });\n',
      },
      {
        folderName: "src",
        items: [
          {
            filename: "main",
            fileExtension: "js",
            content:
              'import { createApp } from "vue";\nimport App from "./App.vue";\n\ncreateApp(App).mount("#app");\n',
          },
          {
            filename: "App",
            fileExtension: "vue",
            content:
              "<template><h1>Hello Vue</h1></template>\n<script setup>\n</script>\n",
          },
        ],
      },
    ],
  },
  HONO: {
    folderName: "Root",
    items: [
      {
        filename: "package",
        fileExtension: "json",
        content:
          '{\n  "name": "hono-fallback",\n  "private": true,\n  "type": "module",\n  "scripts": {\n    "dev": "tsx server.ts",\n    "start": "tsx server.ts"\n  },\n  "dependencies": {\n    "hono": "^4.9.1",\n    "@hono/node-server": "^1.14.0",\n    "tsx": "^4.20.6",\n    "typescript": "^5.9.3"\n  }\n}',
      },
      {
        filename: "server",
        fileExtension: "ts",
        content:
          'import { serve } from "@hono/node-server";\nimport app from "./index";\n\nserve({\n  fetch: app.fetch,\n  port: 3000,\n});\n',
      },
      {
        filename: "index",
        fileExtension: "ts",
        content:
          'import { Hono } from "hono";\nconst app = new Hono();\napp.get("/", (c) => c.text("Hello Hono"));\nexport default app;\n',
      },
    ],
  },
  ANGULAR: {
    folderName: "Root",
    items: [
      {
        filename: "package",
        fileExtension: "json",
        content:
          '{\n  "name": "angular-fallback",\n  "private": true,\n  "scripts": {\n    "dev": "node server.js",\n    "start": "node server.js"\n  }\n}',
      },
      {
        filename: "server",
        fileExtension: "js",
        content:
          'const http = require("http");\nconst html = "<!doctype html><html><body><h1>Hello Angular Fallback</h1></body></html>";\nhttp.createServer((_req, res) => {\n  res.writeHead(200, { "Content-Type": "text/html" });\n  res.end(html);\n}).listen(3000);\n',
      },
      {
        filename: "main",
        fileExtension: "ts",
        content:
          'console.log("Hello Angular fallback");\n',
      },
    ],
  },
};

// Helper function to ensure valid JSON
function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data)); // Ensures it's serializable
    return true;
  } catch (error) {
    console.error("Invalid JSON structure:", error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const param = await params;
  const id = param.id;

  if (!id) {
    return Response.json({ error: "Missing playground ID" }, { status: 400 });
  }

  const playground = await db.playground.findUnique({
    where: { id },
  });

  if (!playground) {
    return Response.json({ error: "Playground not found" }, { status: 404 });
  }

  const templateKey = playground.template as keyof typeof templatePaths;
  const templatePath = templatePaths[templateKey];

  if (!templatePath) {
    return Response.json({ error: "Invalid template" }, { status: 404 });
  }

  try {
    const cacheMap = templateCache as Record<
      string,
      TemplateFolder | undefined
    >;
    const cachedTemplate = cacheMap[templateKey];

    let result: TemplateFolder | null = cachedTemplate ?? null;

    if (!result) {
      try {
        result = await scanTemplateDirectory(
          path.join(process.cwd(), templatePath),
        );
      } catch (error) {
        console.warn(
          `Template source missing for ${templateKey}, using fallback template.`,
          error,
        );
        result = fallbackTemplates[templateKey] ?? {
          folderName: "Root",
          items: [],
        };
      }
    }

    // Validate the JSON structure before saving
    if (!validateJsonStructure(result.items)) {
      return Response.json(
        { error: "Invalid JSON structure" },
        { status: 500 },
      );
    }

    return Response.json(
      { success: true, templateJson: result },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating template JSON:", error);
    return Response.json(
      { error: "Failed to generate template" },
      { status: 500 },
    );
  }
}
