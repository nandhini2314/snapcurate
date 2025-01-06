import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { chapterId } = await req.json();
    
    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
} 