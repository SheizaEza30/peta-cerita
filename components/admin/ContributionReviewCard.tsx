"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RejectDialog } from "./RejectDialog";
import { formatDate } from "@/lib/utils";

export type ReviewableContribution = {
  id: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  submissionData: {
    title?: string;
    synopsis?: string;
    content?: string;
    categoryId?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    province?: string;
    period?: string;
    source?: string;
    heroImage?: string;
    confirmAccurate?: boolean;
  };
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  story: {
    id: string;
    slug: string;
    status: string;
  } | null;
  reviewer: {
    id: string;
    username: string;
    name: string | null;
  } | null;
};

type ContributionReviewCardProps = {
  contribution: ReviewableContribution;
  categoryName?: string;
  categoryColor?: string;
};

export function ContributionReviewCard({
  contribution,
  categoryName,
  categoryColor,
}: ContributionReviewCardProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const data = contribution.submissionData;
  const location = [data.city, data.province].filter(Boolean).join(", ");

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(
        `/api/admin/contributions/${contribution.id}/approve`,
        { method: "POST" }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Gagal menyetujui kontribusi");
        setApproving(false);
        return;
      }

      toast.success(
        `"${data.title}" disetujui! Story berhasil dipublikasikan.`
      );
      router.refresh();
    } catch (err) {
      console.error("[APPROVE_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setApproving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                className={
                  contribution.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700 border-0"
                    : contribution.status === "APPROVED"
                      ? "bg-green-100 text-green-700 border-0"
                      : contribution.status === "REJECTED"
                        ? "bg-red-100 text-red-700 border-0"
                        : "bg-gray-100 text-gray-700 border-0"
                }
              >
                {contribution.status}
              </Badge>

              {categoryName && (
                <Badge
                  variant="secondary"
                  style={
                    categoryColor
                      ? {
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                          borderColor: `${categoryColor}40`,
                        }
                      : undefined
                  }
                >
                  {categoryName}
                </Badge>
              )}

              <span className="text-xs text-muted-foreground">
                {formatDate(contribution.createdAt)}
              </span>
            </div>

            <h3 className="mb-1 font-semibold leading-tight">
              {data.title ?? "Tanpa Judul"}
            </h3>

            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3" />
                @{contribution.user.username}
                {contribution.user.name && ` (${contribution.user.name})`}
              </span>
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {location}
                </span>
              )}
              {data.period && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {data.period}
                </span>
              )}
            </div>

            {data.synopsis && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {data.synopsis}
              </p>
            )}
          </div>
        </div>

        {/* Expandable detail */}
        {expanded && (
          <>
            <Separator />
            <div className="space-y-4 p-4">
              {/* Content */}
              {data.content && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Isi Cerita
                  </p>
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {data.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Source */}
              {data.source && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sumber / Referensi
                  </p>
                  <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                    {data.source}
                  </div>
                </div>
              )}

              {/* Coordinates */}
              {data.latitude !== undefined && data.longitude !== undefined && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Koordinat
                  </p>
                  <div className="flex gap-2 text-sm">
                    <code className="rounded bg-muted px-2 py-1">
                      Lat: {data.latitude.toFixed(6)}
                    </code>
                    <code className="rounded bg-muted px-2 py-1">
                      Lng: {data.longitude.toFixed(6)}
                    </code>
                  </div>
                </div>
              )}

              {/* Rejection reason — kalau REJECTED */}
              {contribution.status === "REJECTED" &&
                contribution.rejectionReason && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-700">
                      Alasan Ditolak
                    </p>
                    <p className="text-sm text-red-800">
                      {contribution.rejectionReason}
                    </p>
                  </div>
                )}

              {/* Story link — kalau APPROVED */}
              {contribution.story && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-green-700">
                        Cerita Sudah Dipublikasikan
                      </p>
                      <p className="text-xs text-green-800">
                        /story/{contribution.story.slug}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/story/${contribution.story.slug}`}>
                        <ExternalLink className="size-3.5 mr-1.5" />
                        Lihat
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex items-center justify-between gap-2 bg-muted/20 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <FileText className="size-3.5 mr-1.5" />
            {expanded ? "Sembunyikan Detail" : "Lihat Detail"}
          </Button>

          {contribution.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectOpen(true)}
                disabled={approving}
                className="text-destructive hover:text-destructive"
              >
                <XCircle className="size-4 mr-1.5" />
                Tolak
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={approving}
                className="bg-green-600 hover:bg-green-700"
              >
                {approving ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                    Menyetujui...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-1.5" />
                    Setujui
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Reject dialog */}
      <RejectDialog
        contributionId={contribution.id}
        contributionTitle={data.title ?? "Tanpa Judul"}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
      />
    </Card>
  );
}