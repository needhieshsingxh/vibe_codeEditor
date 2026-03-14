"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

const getAllPlaygroundForUser = async () => {
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
        starMarks: {
          where: {
            userId: user.id,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });
    return playground.map((item) => ({
      ...item,
      Starmark: item.starMarks,
    }));
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

export default getAllPlaygroundForUser;
