import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { chapterId, content } = await req.json();
    
    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        name: content,
      },
    });

    return NextResponse.json({ success: true, chapter: updatedChapter });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update chapter" },
      { status: 500 }
    );
  }
} 