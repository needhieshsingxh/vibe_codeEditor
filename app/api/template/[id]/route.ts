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
          '{\n  "name": "react-app",\n  "private": true,\n  "scripts": { "dev": "vite" }\n}',
      },
      {
        filename: "main",
        fileExtension: "jsx",
        content:
          'import React from "react";\nimport ReactDOM from "react-dom/client";\n\nReactDOM.createRoot(document.getElementById("root")).render(<h1>Hello React</h1>);\n',
      },
    ],
  },
  NEXTJS: {
    folderName: "Root",
    items: [
      {
        filename: "page",
        fileExtension: "tsx",
        content:
          "export default function Page() { return <h1>Hello Next.js</h1>; }\n",
      },
    ],
  },
  EXPRESS: {
    folderName: "Root",
    items: [
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
        filename: "App",
        fileExtension: "vue",
        content:
          "<template><h1>Hello Vue</h1></template>\n<script setup>\n</script>\n",
      },
    ],
  },
  HONO: {
    folderName: "Root",
    items: [
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
        filename: "main",
        fileExtension: "ts",
        content:
          'console.log("Hello Angular");\n// Fallback template generated because starter files were unavailable at runtime.\n',
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
