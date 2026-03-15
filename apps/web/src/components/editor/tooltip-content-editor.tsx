"use client";

import { Button } from "@porygon/ui/components/button";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface TooltipContentEditorProps {
  content: Record<string, unknown> | null;
  hotspotId: string;
  onChange: (json: Record<string, unknown>) => void;
}

export function TooltipContentEditor({
  content,
  hotspotId,
  onChange,
}: TooltipContentEditorProps) {
  const contentRef = useRef(content);
  contentRef.current = content;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: content ?? undefined,
    onUpdate({ editor: e }) {
      onChange(e.getJSON());
    },
    editorProps: {
      attributes: {
        class: "tiptap prose-sm min-h-[60px] max-h-[200px] overflow-y-auto px-2 py-1.5 text-sm focus:outline-none",
      },
    },
  });

  // Reset content when switching hotspots (not on content change — preserves cursor)
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(
        contentRef.current ?? { type: "doc", content: [] },
      );
    }
  }, [hotspotId, editor]);

  if (!editor) return null;

  const toggleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-input overflow-hidden rounded-md border">
      <div className="border-border flex gap-0.5 border-b p-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold") || undefined}
          className="data-[active]:bg-accent"
          title="Bold"
          type="button"
        >
          <Bold className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic") || undefined}
          className="data-[active]:bg-accent"
          title="Italic"
          type="button"
        >
          <Italic className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={toggleLink}
          data-active={editor.isActive("link") || undefined}
          className="data-[active]:bg-accent"
          title="Link"
          type="button"
        >
          <LinkIcon className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList") || undefined}
          className="data-[active]:bg-accent"
          title="Bullet list"
          type="button"
        >
          <List className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList") || undefined}
          className="data-[active]:bg-accent"
          title="Ordered list"
          type="button"
        >
          <ListOrdered className="size-3" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
