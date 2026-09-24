"use client";

import { useState } from "react";
import { StorytellingMode } from "@/components/story/StorytellingMode";
import { StoryActions } from "@/components/story/StoryActions";

type StoryDetailClientProps = {
  storyId: string;
  storySlug: string;
  title: string;
  content: string;
  heroImage: string | null;
  initialSaved: boolean;
  category: { name: string; color: string | null } | null;
};

export function StoryDetailClient({
  storyId,
  storySlug,
  title,
  content,
  heroImage,
  initialSaved,
  category,
}: StoryDetailClientProps) {
  const [storytellingOpen, setStorytellingOpen] = useState(false);

  return (
    <>
      <StoryActions
        storyId={storyId}
        storySlug={storySlug}
        initialSaved={initialSaved}
        onOpenStorytelling={() => setStorytellingOpen(true)}
      />

      <StorytellingMode
        title={title}
        content={content}
        heroImage={heroImage}
        category={category}
        open={storytellingOpen}
        onClose={() => setStorytellingOpen(false)}
      />
    </>
  );
}