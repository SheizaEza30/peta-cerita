"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteContributionDialog } from "./DeleteContributionDialog";

type ContributionActionsProps = {
  contributionId: string;
  contributionTitle: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  storySlug: string | null;
};

export function ContributionActions({
  contributionId,
  contributionTitle,
  status,
  storySlug,
}: ContributionActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canEdit = status === "DRAFT" || status === "REJECTED";
  const canDelete = status === "DRAFT" || status === "REJECTED";

  return (
    <>
      <div className="flex shrink-0 flex-col gap-2">
        {storySlug && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/story/${storySlug}`}>
              <Eye className="size-3.5 mr-1.5" />
              Lihat
            </Link>
          </Button>
        )}

        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/contribute/${contributionId}/edit`}>
              <Pencil className="size-3.5 mr-1.5" />
              Edit
            </Link>
          </Button>
        )}

        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            Hapus
          </Button>
        )}
      </div>

      <DeleteContributionDialog
        contributionId={contributionId}
        contributionTitle={contributionTitle}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}