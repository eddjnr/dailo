"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useAppStore } from "@/lib/store";
import { Plus, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Button } from "../ui/button";

export function NotesWidget() {
  const {
    notes,
    activeNoteId,
    addNote,
    updateNote,
    deleteNote,
    setActiveNote,
  } = useAppStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: activeNote?.content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "outline-none h-full prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { content: editor.getHTML() });
      }
    },
  });

  // Update editor content when switching notes
  useEffect(() => {
    if (editor && activeNote) {
      const currentContent = editor.getHTML();
      if (currentContent !== activeNote.content) {
        editor.commands.setContent(activeNote.content || "");
      }
    }
  }, [editor, activeNote, activeNoteId]);

  const handleAddNote = useCallback(() => {
    addNote();
  }, [addNote]);

  const handleDeleteNote = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteNote(id);
    },
    [deleteNote],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { title: e.target.value });
      }
    },
    [activeNoteId, updateNote],
  );

  // If no notes, show empty state with create button
  if (notes.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="default" className="text-muted-foreground/40">
            <FileText className="size-8" />
          </EmptyMedia>
          <EmptyTitle className="text-muted-foreground/90">No notes yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any notes yet. Get started by creating
            your first note.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button  onClick={handleAddNote} variant='outline'>Create Note</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      {/* Notes tabs */}
      <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-1 scrollbar-hide">
        {notes.map((note) => (
          <div
            key={note.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveNote(note.id)}
            onKeyDown={(e) => e.key === 'Enter' && setActiveNote(note.id)}
            className={cn(
              "group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all shrink-0 cursor-pointer",
              activeNoteId === note.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span className="truncate max-w-[80px]">{note.title}</span>
            <button
              onClick={(e) => handleDeleteNote(e, note.id)}
              className={cn(
                "p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-destructive/20 hover:text-destructive",
              )}
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddNote}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          title="Add note"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Title input */}
      {activeNote && (
        <input
          type="text"
          value={activeNote.title}
          onChange={handleTitleChange}
          className="text-sm font-medium bg-transparent border-none outline-none px-0 w-full"
          placeholder="Note title..."
          spellCheck={false}
        />
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent editor={editor} className=" text-sm" />
      </div>
    </div>
  );
}
