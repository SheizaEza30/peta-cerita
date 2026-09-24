"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, ExternalLink, Trash2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteStoryDialog } from "./DeleteStoryDialog";

type StoryActionsMenuProps = {
  storyId: string;
  storySlug: string;
  storyTitle: string;
};

export function StoryActionsMenu({
  storyId,
  storySlug,
  storyTitle,
}: StoryActionsMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Menu aksi cerita"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
            {storyTitle}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href={`/story/${storySlug}`}
              className="cursor-pointer"
              target="_blank"
            >
              <ExternalLink className="size-4 mr-2" />
              Lihat Cerita
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/contribute/${storyId}/edit`}
              className="cursor-pointer"
            >
              <Pencil className="size-4 mr-2" />
              Edit Cerita
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            Hapus Cerita
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteStoryDialog
        storyId={storyId}
        storySlug={storySlug}
        storyTitle={storyTitle}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}