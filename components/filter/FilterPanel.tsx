"use client";

import { SlidersHorizontal, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

type FilterPanelProps = {
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  onClear: () => void;
};

export function FilterPanel({
  selectedSlugs,
  onToggle,
  onClear,
}: FilterPanelProps) {
  const hasFilters = selectedSlugs.length > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={hasFilters ? "default" : "outline"}
          size="sm"
          className="shadow-card"
        >
          <SlidersHorizontal className="size-4 mr-1.5" />
          Filter
          {hasFilters && (
            <Badge
              variant="secondary"
              className="ml-2 size-5 justify-center rounded-full p-0 text-[10px]"
            >
              {selectedSlugs.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filter Cerita</SheetTitle>
          <SheetDescription>
            Pilih kategori yang ingin ditampilkan di peta.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedSlugs.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                onClick={() => onToggle(cat.slug)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                {isSelected && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <div className="mt-6 border-t border-border pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClear}
            >
              <X className="size-4 mr-2" />
              Hapus Semua Filter
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}