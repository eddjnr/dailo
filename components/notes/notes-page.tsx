'use client'

import { NotesSidebar } from './notes-sidebar'
import { NoteEditor } from './note-editor'

export function NotesPage() {
  return (
    <div className="flex h-screen">
      <NotesSidebar />
      <NoteEditor />
    </div>
  )
}
