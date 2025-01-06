import { Chapter, Unit } from "@prisma/client";
import React from "react";

type RelatedVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
};

type Props = {
  chapter: Chapter & { relatedVideos?: string };
  unit: Unit;
  unitIndex: number;
  chapterIndex: number;
};

const MainVideoSummary = ({
  unit,
  unitIndex,
  chapter,
  chapterIndex,
}: Props) => {
  const relatedVideos: RelatedVideo[] = chapter.relatedVideos 
    ? JSON.parse(chapter.relatedVideos)
    : [];

  return (
    <div className="flex-[2] mt-16">
      <h4 className="text-sm uppercase text-secondary-foreground/60">
        Unit {unitIndex + 1} &bull; Chapter {chapterIndex + 1}
      </h4>
      <h1 className="text-4xl font-bold">{chapter.name}</h1>
      <iframe
        title="chapter video"
        className="w-full mt-4 aspeect-video max-h-[24rem]"
        src={`https://www.youtube.com/embed/${chapter.videoId}`}
        allowFullScreen
      />
      <div className="mt-4">
        <h3 className="text-3xl font-semibold">Summary</h3>
        <p className="mt-2 text-secondary-foreground/80">{chapter.summary}</p>
      </div>
      
      <div className="mt-8">
        <h3 className="text-3xl font-semibold">Detailed Content</h3>
        <p className="mt-2 text-secondary-foreground/80">
          {chapter.detailedContent?.replace(/[*#]/g, '')}
        </p>
      </div>
      
      {relatedVideos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-3xl font-semibold">Related Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {relatedVideos.map((video, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold line-clamp-2">{video.title}</h4>
                  <a 
                    href={`https://youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainVideoSummary;
