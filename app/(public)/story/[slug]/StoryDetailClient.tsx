"use client";

import { useState } from "react";
import { StorytellingMode } from "@/components/story/StorytellingMode";
import { StoryActions } from "@/components/story/StoryActions";

type StoryDetailClientProps = {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  content: string;
  heroImage: string | null;
  initialSaved: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  category: { name: string; color: string | null } | null;
};

export function StoryDetailClient({
  storyId,
  storySlug,
  storyTitle,
  content,
  heroImage,
  initialSaved,
  isOwner,
  isAdmin,
  category,
}: StoryDetailClientProps) {
  const [storytellingOpen, setStorytellingOpen] = useState(false);

  return (
    <>
      <StoryActions
        storyId={storyId}
        storySlug={storySlug}
        storyTitle={storyTitle}
        initialSaved={initialSaved}
        isOwner={isOwner}
        isAdmin={isAdmin}
        onOpenStorytelling={() => setStorytellingOpen(true)}
      />

      <StorytellingMode
        title={storyTitle}
        content={content}
        heroImage={heroImage}
        category={category}
        open={storytellingOpen}
        onClose={() => setStorytellingOpen(false)}
      />
    </>
  );
}