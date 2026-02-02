'use client'

import { useState } from 'react'
import { Plus, Clock } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { BlockForm } from './block-form'
import { BlockItem } from './block-item'
import { DEFAULT_FORM_DATA, BlockFormData } from './constants'
import type { TimeBlock } from '@/lib/types'

export function TimeBlockWidget() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BlockFormData>(DEFAULT_FORM_DATA)

  const sortedBlocks = [...timeBlocks].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    if (editingId) {
      updateTimeBlock(editingId, formData)
      setEditingId(null)
    } else {
      addTimeBlock(formData)
      setIsAdding(false)
    }
    setFormData(DEFAULT_FORM_DATA)
  }

  const handleEdit = (block: TimeBlock) => {
    setEditingId(block.id)
    setFormData({
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
    })
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData(DEFAULT_FORM_DATA)
  }

  const handleStartAdding = () => {
    setIsAdding(true)
    setFormData(DEFAULT_FORM_DATA)
  }

  const showEmptyState = sortedBlocks.length === 0 && !isAdding

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {showEmptyState ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="default" className="text-muted-foreground/40">
                <Clock className="size-8" />
              </EmptyMedia>
              <EmptyTitle className="text-muted-foreground/90">No blocks scheduled</EmptyTitle>
              <EmptyDescription>
                Plan your day by adding time blocks for focused work sessions.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={handleStartAdding} variant="outline">Add Block</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-1">
            {sortedBlocks.map((block) => {
              if (editingId === block.id) {
                return (
                  <BlockForm
                    key={block.id}
                    formData={formData}
                    onFormChange={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                )
              }

              return (
                <BlockItem
                  key={block.id}
                  block={block}
                  onEdit={handleEdit}
                  onDelete={deleteTimeBlock}
                />
              )
            })}
          </div>
        )}

        {isAdding && (
          <BlockForm
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>

      {!isAdding && !editingId && sortedBlocks.length > 0 && (
        <button
          onClick={handleStartAdding}
          className="mt-2 shrink-0 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300 group"
        >
          <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add block</span>
        </button>
      )}
    </div>
  )
}
