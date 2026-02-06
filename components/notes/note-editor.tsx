'use client'

import { useCallback, useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Highlight } from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  Undo2,
  Redo2,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  FileText,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

import '@/components/editor/tiptap-node/list-node/list-node.scss'

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-colors',
        isActive
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

export function NoteEditor() {
  const notes = useAppStore((state) => state.notes)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const updateNote = useAppStore((state) => state.updateNote)
  const addNote = useAppStore((state) => state.addNote)

  const activeNote = notes.find((n) => n.id === activeNoteId)
  const mountedRef = useRef(true)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'outline-none min-h-[500px] prose prose-base dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0',
        spellcheck: 'false',
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
        placeholder: 'Start writing your note...',
      }),
    ],
    content: activeNote?.content || '',
    onUpdate: ({ editor }) => {
      if (activeNoteId && mountedRef.current) {
        updateNote(activeNoteId, { content: editor.getHTML() })
      }
    },
  })

  // Update editor content when switching notes
  useEffect(() => {
    if (editor && activeNote) {
      const currentContent = editor.getHTML()
      if (currentContent !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '')
      }
    }
  }, [editor, activeNote, activeNoteId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (editor && !editor.isDestroyed) {
        editor.destroy()
      }
    }
  }, [editor])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { title: e.target.value })
      }
    },
    [activeNoteId, updateNote]
  )

  // Empty state when no note is selected
  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <FileText className="size-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-medium text-muted-foreground mb-2">
          No note selected
        </h2>
        <p className="text-sm text-muted-foreground/60 mb-6">
          Select a note from the sidebar or create a new one
        </p>
        <button
          onClick={() => addNote()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Create New Note
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-border/50 px-6 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo"
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo"
          >
            <Redo2 className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor?.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor?.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            title="Bold"
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            title="Italic"
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            isActive={editor?.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            isActive={editor?.isActive('taskList')}
            title="Task List"
          >
            <CheckSquare className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Title */}
          <input
            type="text"
            value={activeNote.title}
            onChange={handleTitleChange}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-2 placeholder:text-muted-foreground/40"
            placeholder="Untitled"
            spellCheck={false}
          />

          {/* Meta */}
          <p className="text-sm text-muted-foreground mb-6">
            Last edited {format(new Date(activeNote.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}
          </p>

          {/* Editor */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
