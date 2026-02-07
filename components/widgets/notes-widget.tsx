"use client";

import { memo, useCallback, useRef, useEffect } from "react";
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
import { NotionEditor } from "@/components/editor/notion-editor";
import type { Editor } from "@tiptap/react";

export const NotesWidget = memo(function NotesWidget() {
  const notes = useAppStore((state) => state.notes);
  const activeNoteId = useAppStore((state) => state.activeNoteId);
  const addNote = useAppStore((state) => state.addNote);
  const updateNote = useAppStore((state) => state.updateNote);
  const deleteNote = useAppStore((state) => state.deleteNote);
  const setActiveNote = useAppStore((state) => state.setActiveNote);

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const editorRef = useRef<Editor | null>(null);
  const lastNoteIdRef = useRef<string | null>(null);

  const handleContentChange = useCallback(
    (html: string) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { content: html });
      }
    },
    [activeNoteId, updateNote]
  );

  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const handleAddNote = useCallback(() => {
    addNote();
  }, [addNote]);

  const handleDeleteNote = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteNote(id);
    },
    [deleteNote]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { title: e.target.value });
      }
    },
    [activeNoteId, updateNote]
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editorRef.current?.commands.focus("start");
      }
    },
    []
  );

  // Update editor content when switching notes
  useEffect(() => {
    if (editorRef.current && activeNote && activeNoteId !== lastNoteIdRef.current) {
      editorRef.current.commands.setContent(activeNote.content || "");
      lastNoteIdRef.current = activeNoteId;
    }
  }, [activeNote, activeNoteId]);

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
          <Button onClick={handleAddNote} variant="outline">Create Note</Button>
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
            onKeyDown={(e) => e.key === "Enter" && setActiveNote(note.id)}
            className={cn(
              "group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all shrink-0 cursor-pointer",
              activeNoteId === note.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span className="truncate max-w-[80px]">{note.title}</span>
            <button
              onClick={(e) => handleDeleteNote(e, note.id)}
              className={cn(
                "p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-destructive/20 hover:text-destructive"
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
          onKeyDown={handleTitleKeyDown}
          className="text-sm font-medium bg-transparent border-none outline-none px-0 w-full"
          placeholder="Note title..."
          spellCheck={false}
        />
      )}

      {/* Editor */}
      {activeNote && (
        <div className="flex-1 min-h-0 overflow-y-auto notes-widget-editor">
          <NotionEditor
            content={activeNote.content || ""}
            onChange={handleContentChange}
            onEditor={handleEditorReady}
            placeholder="Type '/' for commands..."
          />
        </div>
      )}
    </div>
  );
})
