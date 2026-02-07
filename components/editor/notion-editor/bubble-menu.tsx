'use client'

import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import { useEditorState, type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  Underline,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'

import './bubble-menu.scss'

interface BubbleMenuProps {
  editor: Editor
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      className={cn(
        'bubble-menu-button',
        isActive && 'bubble-menu-button--active'
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="bubble-menu-divider" />
}

export function BubbleMenuComponent({ editor }: BubbleMenuProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Subscribe to editor state changes to update active states
  const editorState = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isUnderline: e.isActive('underline'),
      isStrike: e.isActive('strike'),
      isCode: e.isActive('code'),
      isHighlight: e.isActive('highlight'),
      isLink: e.isActive('link'),
    }),
    // Force re-render on any state change
    equalityFn: () => false,
  })

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    }
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  const removeLink = useCallback(() => {
    editor.chain().focus().unsetLink().run()
    setShowLinkInput(false)
  }, [editor])

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="bubble-menu"
      updateDelay={100}
    >
      {showLinkInput ? (
        <div className="bubble-menu-link-input">
          <input
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setLink()
              }
              if (e.key === 'Escape') {
                setShowLinkInput(false)
                setLinkUrl('')
              }
            }}
            autoFocus
            className="bubble-menu-input"
          />
          <button
            onClick={setLink}
            className="bubble-menu-link-btn"
            type="button"
          >
            Add
          </button>
          {editorState.isLink && (
            <button
              onClick={removeLink}
              className="bubble-menu-link-btn bubble-menu-link-btn--remove"
              type="button"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editorState.isBold}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editorState.isItalic}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editorState.isUnderline}
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editorState.isStrike}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editorState.isCode}
            title="Inline Code"
          >
            <Code size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editorState.isHighlight}
            title="Highlight"
          >
            <Highlighter size={16} />
          </ToolbarButton>
{/* 
          <Divider />

          <ToolbarButton
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href
              setLinkUrl(previousUrl || '')
              setShowLinkInput(true)
            }}
            isActive={editorState.isLink}
            title="Add Link"
          >
            <Link size={16} />
          </ToolbarButton> */}
        </>
      )}
    </TiptapBubbleMenu>
  )
}
