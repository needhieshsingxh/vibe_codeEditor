"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return [];
  }

  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
        Starmark: {
          where: {
            userId: user.id,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });
    return playground;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const toggleStarMarked = async (
  playgroundId: string,
  isMarked: boolean,
) => {
  const user = await currentUser();

  if (!user?.id) {
    return { success: false, error: "Unauthorized", isMarked };
  }

  try {
    await db.starMark.upsert({
      where: {
        userId_playgroundId: {
          userId: user.id,
          playgroundId,
        },
      },
      create: {
        userId: user.id,
        playgroundId,
        isMarked,
      },
      update: {
        isMarked,
      },
    });

    return { success: true, error: null, isMarked };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Failed to toggle favorite", isMarked };
  }
};

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();
  if (!user?.id) {
    return null;
  }
  const { template, title, description } = data;
  try {
    const playground = await db.playground.create({
      data: {
        title: title,
        description: description,
        template: template,
        userId: user.id,
      },
    });
    revalidatePath("/dashboard");
    return playground;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteProjectById = async (id: string) => {
  try {
    await db.playground.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

export const editProjectById = async (
  id: string,
  data: { title: string; description?: string },
) => {
  try {
    await db.playground.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        description: data.description,
      },
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

export const duplicateProjectById = async (id: string) => {
  try {
    const originalPlayground = await db.playground.findUnique({
      where: { id },
    });
    if (!originalPlayground) {
      throw new Error("Original Playground not found");
    }
    const duplicatedPlayground = db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId: originalPlayground.userId,

        //todo: add template
      },
    });
    revalidatePath("/dashboard");
    return duplicatedPlayground;
  } catch (error) {
    console.log(error);
  }
};
