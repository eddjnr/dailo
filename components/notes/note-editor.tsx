'use client'

import { useCallback, useEffect, useRef } from 'react'
import { FileText } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { format } from 'date-fns'
import { NotionEditor } from '@/components/editor/notion-editor'
import type { Editor } from '@tiptap/react'

export function NoteEditor() {
  const notes = useAppStore((state) => state.notes)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const updateNote = useAppStore((state) => state.updateNote)
  const addNote = useAppStore((state) => state.addNote)

  const activeNote = notes.find((n) => n.id === activeNoteId)
  const editorRef = useRef<Editor | null>(null)
  const lastNoteIdRef = useRef<string | null>(null)

  const handleContentChange = useCallback(
    (html: string) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { content: html })
      }
    },
    [activeNoteId, updateNote]
  )

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { title: e.target.value })
      }
    },
    [activeNoteId, updateNote]
  )

  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor
  }, [])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        editorRef.current?.commands.focus('start')
      }
    },
    []
  )

  // Update editor content when switching notes
  useEffect(() => {
    if (editorRef.current && activeNote && activeNoteId !== lastNoteIdRef.current) {
      editorRef.current.commands.setContent(activeNote.content || '')
      lastNoteIdRef.current = activeNoteId
    }
  }, [activeNote, activeNoteId])

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
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
             {/* Meta */}
          <p className="text-sm text-muted-foreground mb-6">
            Last edited {format(new Date(activeNote.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}
          </p>

          {/* Title */}
          <input
            type="text"
            value={activeNote.title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-2 placeholder:text-muted-foreground/40"
            placeholder="Untitled"
            spellCheck={false}
          />

          {/* Editor */}
          <NotionEditor
            content={activeNote.content || ''}
            onChange={handleContentChange}
            onEditor={handleEditorReady}
            placeholder="Type '/' for commands..."
          />
        </div>
      </div>
    </div>
  )
}
