"use client";
import { Chapter, Course, Unit } from "@prisma/client";
import React, { createRef, useMemo } from "react";
import ChapterCard, { ChapterCardHandler } from "./ChapterCard";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "./ui/use-toast";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const ConfirmChapters = ({ course }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [chapters, setChapters] = React.useState<Chapter[]>(
    course.units.flatMap(unit => unit.chapters)
  );

  const chapterRefs = useMemo(() => {
    const refs: { [key: string]: React.RefObject<ChapterCardHandler> } = {};
    chapters.forEach((chapter) => {
      refs[chapter.id] = createRef<ChapterCardHandler>();
    });
    return refs;
  }, [chapters]);

  const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(
    new Set()
  );

  const totalChaptersCount = React.useMemo(() => {
    return chapters.length;
  }, [chapters]);

  const onRemoveChapter = async (chapterId: string) => {
    try {
      await axios.delete("/api/chapter/delete", {
        data: { chapterId },
      });
      
      setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
      setCompletedChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterId);
        return newSet;
      });
    } catch (error) {
      console.error("Error removing chapter:", error);
      toast({
        title: "Error",
        description: "Failed to remove chapter",
        variant: "destructive",
      });
    }
  };

  const onEdit = async (chapterId: string, newContent: string) => {
    try {
      const response = await axios.put("/api/chapter/edit", {
        chapterId,
        content: newContent,
      });
      
      // Update the chapters state with the edited content
      setChapters(prev => prev.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, name: newContent }
          : chapter
      ));

      toast({
        title: "Success",
        description: "Chapter updated successfully",
      });
    } catch (error) {
      console.error("Error updating chapter:", error);
      toast({
        title: "Error",
        description: "Failed to update chapter",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full mt-4">
      {course.units.map((unit, unitIndex) => {
        const unitChapters = chapters.filter(chapter => chapter.unitId === unit.id);
        return (
          <div key={unit.id} className="mt-5">
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Unit {unitIndex + 1}
            </h2>
            <h3 className="text-2xl font-bold">{unit.name}</h3>
            <div className="mt-3">
              {unitChapters.map((chapter, chapterIndex) => {
                return (
                  <ChapterCard
                    completedChapters={completedChapters}
                    setCompletedChapters={setCompletedChapters}
                    onEdit={onEdit}
                    ref={chapterRefs[chapter.id]}
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                    onRemove={() => onRemoveChapter(chapter.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center mt-4">
        <Separator className="flex-[1]" />
        <div className="flex items-center mx-4">
          <Link
            href="/create"
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={4} />
            Back
          </Link>
          {totalChaptersCount === completedChapters.size ? (
            <Link
              className={buttonVariants({
                className: "ml-4 font-semibold",
              })}
              href={`/course/${course.id}/0/0`}
            >
              Save & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <Button
              type="button"
              className="ml-4 font-semibold"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                Object.values(chapterRefs).forEach((ref) => {
                  ref.current?.triggerLoad();
                });
              }}
            >
              Generate
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={4} />
            </Button>
          )}
        </div>
        <Separator className="flex-[1]" />
      </div>
    </div>
  );
};

export default ConfirmChapters;
