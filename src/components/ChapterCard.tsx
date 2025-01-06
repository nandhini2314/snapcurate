"use client";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { Edit, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapters: Set<String>;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
  onRemove: () => void;
  onEdit: (chapterId: string, newName: string) => void;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ chapter, chapterIndex, setCompletedChapters, completedChapters, onRemove, onEdit }, ref) => {
    const { toast } = useToast();
    const [success, setSuccess] = React.useState<boolean | null>(null);
    const { mutate: getChapterInfo, status } = useMutation({
      mutationFn: async () => {
        const response = await axios.post("/api/chapter/getInfo", {
          chapterId: chapter.id,
        });
        return response.data;
      },
    });

    const addChapterIdToSet = React.useCallback(() => {
      setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(chapter.id);
        return newSet;
      });
    }, [chapter.id, setCompletedChapters]);

    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        addChapterIdToSet();
      }
    }, [chapter, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (chapter.videoId) {
          addChapterIdToSet();
          return;
        }
        getChapterInfo(undefined, {
          onSuccess: () => {
            setSuccess(true);
            addChapterIdToSet();
          },
          onError: (error) => {
            console.error(error);
            setSuccess(false);
            toast({
              title: "Error",
              description: "There was an error loading your chapter",
              variant: "destructive",
            });
            addChapterIdToSet();
          },
        });
      },
    }));

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(chapter.name);

    const handleEdit = () => {
      if (isEditing) {
        onEdit(chapter.id, editedName);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    };

    return (
      <div
        key={chapter.id}
        className={cn("px-4 py-2 mt-2 rounded flex justify-between", {
          "bg-secondary": success === null,
          "bg-red-500": success === false,
          "bg-green-500": success === true,
        })}
      >
        <div className="flex items-center justify-between w-full">
          <h4 className="text-sm font-bold">Chapter {chapterIndex + 1}</h4>
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mx-2 flex-1"
            />
          ) : (
            <h5 className="flex-1 mx-2">{chapter.name}</h5>
          )}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEdit}
              size="sm"
              variant="ghost"
              className="hover:text-blue-500"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onRemove()}
              size="sm"
              variant="ghost"
              className="hover:text-red-500"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {status === "pending" && <Loader2 className="animate-spin" />}
      </div>
    );
  }
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;
