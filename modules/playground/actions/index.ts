"use server";

import { currentUser } from "@/modules/auth/actions";
import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { revalidatePath } from "next/cache";

export const getPlaygroundById = async (id: string) => {
  try {
    const playground = await db.playground.findUnique({
      where: { id },
      select: {
        templateFiles: {
          select: {
            content: true,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    console.log(error);
  }
};

export const SaveUpdatedCode = async (id: string, data: TemplateFolder) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const updatedPlayground = await db.playground.update({
      where: { id },
      data: {
        templateFiles: {
          create: {
            content: JSON.stringify(data),
          },
        },
      },
    });

    revalidatePath("/playground");
    return updatedPlayground;
  } catch (error) {
    console.error("Error saving playground:", error);
    throw error;
  }
};
