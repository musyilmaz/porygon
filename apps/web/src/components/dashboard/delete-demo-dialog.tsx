"use client";

import type { DemoWithStats } from "@porygon/services";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@porygon/ui/components/alert-dialog";

interface DeleteDemoDialogProps {
  demo: DemoWithStats | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteDemoDialog({
  demo,
  onOpenChange,
  onConfirm,
}: DeleteDemoDialogProps) {
  return (
    <AlertDialog open={demo !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{demo?.title}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this demo and all its steps, hotspots,
            and annotations. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
