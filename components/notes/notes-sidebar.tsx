'use client'

import { useCallback } from 'react'
import { Plus, FileText, Trash2, Search } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function NotesSidebar() {
  const notes = useAppStore((state) => state.notes)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const addNote = useAppStore((state) => state.addNote)
  const deleteNote = useAppStore((state) => state.deleteNote)
  const setActiveNote = useAppStore((state) => state.setActiveNote)

  const handleAddNote = useCallback(() => {
    addNote()
  }, [addNote])

  const handleDeleteNote = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      deleteNote(id)
    },
    [deleteNote]
  )

  return (
    <aside className="w-72 shrink-0 border-r border-border flex flex-col h-full bg-muted/20">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h1 className="text-lg font-semibold mb-3">Notes</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border-none outline-none text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="p-3">
        <button
          onClick={handleAddNote}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileText className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No notes yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create your first note to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveNote(note.id)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveNote(note.id)}
                className={cn(
                  'group relative p-3 rounded-xl cursor-pointer transition-all',
                  activeNoteId === note.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50 border border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      'font-medium text-sm truncate',
                      activeNoteId === note.id ? 'text-primary' : 'text-foreground'
                    )}>
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className={cn(
                      'p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all',
                      'hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
                    )}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
