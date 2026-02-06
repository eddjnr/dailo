"use client";

import { memo, useCallback, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useAppStore } from "@/lib/store";
import { Plus, Trash2, FileText, Bold, Italic, Strikethrough, Undo2, Redo2, List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3 } from "lucide-react";
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

// --- Tiptap Node Styles ---
import "@/components/editor/tiptap-node/list-node/list-node.scss";

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        isActive
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  )
}

export const NotesWidget = memo(function NotesWidget() {
  const notes = useAppStore((state) => state.notes);
  const activeNoteId = useAppStore((state) => state.activeNoteId);
  const addNote = useAppStore((state) => state.addNote);
  const updateNote = useAppStore((state) => state.updateNote);
  const deleteNote = useAppStore((state) => state.deleteNote);
  const setActiveNote = useAppStore((state) => state.setActiveNote);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[100px] prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
        spellcheck: "false",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: activeNote?.content || "",
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

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

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
          <Button onClick={handleAddNote} variant='outline'>Create Note</Button>
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

      {/* Toolbar */}
      {editor && (
        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-muted/30 shrink-0 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 className="size-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
          >
            <Heading3 className="size-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
          >
            <Strikethrough className="size-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            <List className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
          >
            <CheckSquare className="size-3.5" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent editor={editor} className="text-sm" />
      </div>
    </div>
  );
})
