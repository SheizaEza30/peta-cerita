"use client";

import { useState } from "react";
import { MoreVertical, Trash2, UserCog, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

type UserActionsMenuProps = {
  userId: string;
  username: string;
  userName: string | null;
  currentRole: "USER" | "MODERATOR" | "ADMIN";
  isSelf: boolean;
};

export function UserActionsMenu({
  userId,
  username,
  userName,
  currentRole,
  isSelf,
}: UserActionsMenuProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Menu aksi user"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            @{username}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setResetDialogOpen(true)}
            className="cursor-pointer"
          >
            <KeyRound className="size-4 mr-2" />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setRoleDialogOpen(true)}
            disabled={isSelf}
            className="cursor-pointer"
            title={isSelf ? "Tidak dapat mengubah role sendiri" : "Ubah role user"}
          >
            <UserCog className="size-4 mr-2" />
            Ubah Role
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSelf}
            className="cursor-pointer text-destructive focus:text-destructive"
            title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus user"}
          >
            <Trash2 className="size-4 mr-2" />
            Hapus User
          </DropdownMenuItem>

          {isSelf && (
            <>
              <DropdownMenuSeparator />
              <p className="px-2 py-1.5 text-[10px] text-muted-foreground">
                Ini akun Anda
              </p>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ResetPasswordDialog
        userId={userId}
        username={username}
        userName={userName}
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      />

      <ChangeRoleDialog
        userId={userId}
        username={username}
        userName={userName}
        currentRole={currentRole}
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
      />

      <DeleteUserDialog
        userId={userId}
        username={username}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}