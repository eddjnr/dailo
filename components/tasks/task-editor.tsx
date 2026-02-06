'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Trash2, Calendar as CalendarIcon, Tag, Flame, Zap, Leaf, Bold, Italic, List, ListOrdered, CheckSquare, Undo2, Redo2, X } from 'lucide-react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Highlight } from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/types'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import '@/components/editor/tiptap-node/list-node/list-node.scss'

const priorityConfig = {
  1: {
    color: 'text-primary',
    activeColor: 'bg-primary text-primary-foreground',
    borderColor: 'border-primary/50',
    icon: Flame,
    label: 'High',
  },
  2: {
    color: 'text-amber-400',
    activeColor: 'bg-amber-400 text-amber-950',
    borderColor: 'border-amber-400/50',
    icon: Zap,
    label: 'Medium',
  },
  3: {
    color: 'text-muted-foreground',
    activeColor: 'bg-muted-foreground text-background',
    borderColor: 'border-muted-foreground/30',
    icon: Leaf,
    label: 'Low',
  },
}

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  'todo': { label: 'To Do', color: 'bg-muted-foreground/20 text-muted-foreground' },
  'working': { label: 'Working', color: 'bg-amber-500/20 text-amber-400' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
  'done': { label: 'Done', color: 'bg-green-500/20 text-green-400' },
}

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
      type="button"
      className={cn(
        'p-1.5 rounded-md transition-colors',
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

// Separate component for the editor to isolate Tiptap lifecycle
function TaskDescriptionEditor({
  task,
  onUpdate,
}: {
  task: Task
  onUpdate: (description: string) => void
}) {
  const mountedRef = useRef(true)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[150px] prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0',
        spellcheck: 'false',
      },
    },
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Add a description...' }),
    ],
    content: task.description || '',
    onUpdate: ({ editor }) => {
      if (mountedRef.current) {
        onUpdate(editor.getHTML())
      }
    },
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (editor && !editor.isDestroyed) {
        editor.destroy()
      }
    }
  }, [editor])

  if (!editor) return null

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1 rounded-lg bg-muted/30 mb-3 flex-wrap">
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

      {/* Editor */}
      <EditorContent editor={editor} className="text-sm" />
    </>
  )
}

interface TaskEditorProps {
  taskId: string | null
  onClose: () => void
}

export function TaskEditor({ taskId, onClose }: TaskEditorProps) {
  const tasks = useAppStore((state) => state.tasks)
  const updateTask = useAppStore((state) => state.updateTask)
  const deleteTask = useAppStore((state) => state.deleteTask)

  const task = tasks.find((t) => t.id === taskId)

  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (taskId) {
      updateTask(taskId, { title: e.target.value })
    }
  }, [taskId, updateTask])

  const handleDescriptionUpdate = useCallback((description: string) => {
    if (taskId) {
      updateTask(taskId, { description })
    }
  }, [taskId, updateTask])

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && taskId && task) {
      if (!task.tags.includes(tagInput.trim())) {
        updateTask(taskId, { tags: [...task.tags, tagInput.trim()] })
      }
      setTagInput('')
      setShowTagInput(false)
    }
  }, [tagInput, taskId, task, updateTask])

  const handleRemoveTag = useCallback((tag: string) => {
    if (taskId && task) {
      updateTask(taskId, { tags: task.tags.filter((t) => t !== tag) })
    }
  }, [taskId, task, updateTask])

  const handleDelete = useCallback(() => {
    if (taskId) {
      deleteTask(taskId)
      onClose()
    }
  }, [taskId, deleteTask, onClose])

  const isOpen = !!taskId && !!task

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl! max-h-[90vh] p-0 gap-0 overflow-hidden">
        {task && (
          <>
            {/* Header */}
            <DialogHeader className="p-5 pb-0">
              <DialogTitle asChild>
                <input
                  type="text"
                  value={task.title}
                  onChange={handleTitleChange}
                  className="text-lg font-semibold bg-transparent border-none outline-none w-full pr-8"
                  placeholder="Task title..."
                  spellCheck={false}
                />
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-5 pt-4">
              {/* Meta: status, priority, due date */}
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Select
                    value={task.status}
                    onValueChange={(value) => updateTask(taskId!, { status: value as TaskStatus })}
                  >
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Priority:</span>
                  <div className="flex gap-1">
                    {([1, 2, 3] as const).map((p) => {
                      const config = priorityConfig[p]
                      const Icon = config.icon
                      return (
                        <button
                          key={p}
                          onClick={() => updateTask(taskId!, { priority: p })}
                          className={cn(
                            'size-7 rounded-lg flex items-center justify-center transition-all',
                            task.priority === p
                              ? cn(config.activeColor, 'shadow-sm')
                              : cn('border', config.borderColor, config.color, 'hover:scale-105')
                          )}
                          title={config.label}
                        >
                          <Icon className="size-3.5" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Due date */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Due:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          'h-7 px-3 text-xs rounded-md border border-input bg-transparent flex items-center gap-2 hover:bg-accent transition-colors',
                          !task.dueDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="size-3.5" />
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Pick a date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                        onSelect={(date) => updateTask(taskId!, { dueDate: date ? date.toISOString() : null })}
                      />
                      {task.dueDate && (
                        <div className="p-2 border-t">
                          <button
                            onClick={() => updateTask(taskId!, { dueDate: null })}
                            className="text-xs text-destructive hover:underline w-full text-center"
                          >
                            Clear date
                          </button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Tag className="size-3.5 text-muted-foreground" />
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary flex items-center gap-1 group"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {showTagInput ? (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag()
                      if (e.key === 'Escape') {
                        setShowTagInput(false)
                        setTagInput('')
                      }
                    }}
                    onBlur={handleAddTag}
                    placeholder="Add tag..."
                    className="text-xs px-2 py-1 rounded-lg bg-muted/50 border-none outline-none w-20"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-xs px-2 py-1 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    + Add tag
                  </button>
                )}
              </div>

              {/* Description Editor - separate component */}
              <TaskDescriptionEditor
                key={task.id}
                task={task}
                onUpdate={handleDescriptionUpdate}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-border/50">
              <button
                onClick={handleDelete}
                className="text-destructive hover:text-destructive/80 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="size-4" />
                Delete
              </button>

              <span className="text-xs text-muted-foreground">
                Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
