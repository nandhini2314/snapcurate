// /api/course/createChapters

import { NextResponse } from "next/server";
import { createChaptersSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unsplash";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    // Step 1: Authenticate the user
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Step 2: Check user's subscription and credits
    const isPro = await checkSubscription();
    if (session.user.credits <= 0 && !isPro) {
      return new NextResponse("No credits", { status: 402 });
    }

    // Step 3: Parse and validate request body
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);

    // Step 4: Generate course content using GPT (AI)
    const output_units = await strict_output(
      "You are an AI capable of curating course content. Your task is to create a separate chapter for each unit provided. For each chapter, generate a relevant title and a detailed YouTube search query to find an educational video. Ensure that each chapter is distinct and directly related to its corresponding unit and the overall course title.",
      // new Array(units.length).fill(
      //   `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. Then, for each chapter, provide a detailed YouTube search query that can be used to find an educational video for each chapter.It is also your job to create a course about ${units} related to ${title}. The user has requested to create chapters for each of the units. Then, for each chapter, provide a detailed YouTube search query that can be used to find an educational video for each chapter.`
      units.map(unit => 
        `Create a chapter for the unit: ${unit} in the context of the course titled "${title}". The chapter title should be the unit name itself. Provide a chapter title and a YouTube search query for an educational video related to this chapter. Add 3 chapters each`),
      {
        title: "title of the unit",
        chapters: "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
      }
    );

    // Step 5: Generate image search term using GPT
    const imageSearchTerm = await strict_output(
      "You are an AI capable of finding the most relevant image for a course",
      `Provide a good image search term for a course titled "${title}". This search term will be used in the Unsplash API to find relevant images.`,
      { image_search_term: "a good search term for the title of the course" }
    );

    // Step 6: Fetch course image from Unsplash API
    const course_image = await getUnsplashImage(imageSearchTerm.image_search_term);

    // Step 7: Create course in the database
    const course = await prisma.course.create({
      data: {
        name: title,
        image: course_image,
      },
    });

    // Step 8: Create units and chapters in the database
    for (const unit of output_units) {
      const prismaUnit = await prisma.unit.create({
        data: {
          name: unit.title,
          courseId: course.id,
        },
      });

      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter: typeof unit.chapters[number]) => ({
          name: chapter.chapter_title,
          youtubeSearchQuery: chapter.youtube_search_query,
          unitId: prismaUnit.id,
        })),
      });
    }

    // Step 9: Decrement user credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    const user = await prisma.user.upsert({
      
      where: {
        id: session.user.id
      },
      create: {
        id: session.user.id,
        // other required fields
      },
      update: {
        // your update data
      }
    });

    return NextResponse.json({ course_id: course.id });

  } catch (error) {
    console.error(error);

    // Step 10: Improved error handling
    if (error instanceof ZodError) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
