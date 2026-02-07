'use client'

import { useEffect, useRef, useMemo } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Highlight } from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import { Underline } from '@tiptap/extension-underline'
import { Image } from '@tiptap/extension-image'

import { SlashCommandExtension } from '../extensions/slash-command'
import { DragHandle } from '../extensions/drag-handle'
import { CodeBlockExtension } from '../extensions/code-block'
import { BlockquoteExtension } from '../extensions/blockquote'
import { BubbleMenuComponent } from './bubble-menu'

import './notion-editor.scss'
import '../tiptap-node/list-node/list-node.scss'
import '../extensions/slash-command/slash-command.scss'
import '../extensions/drag-handle/drag-handle.scss'
import '../extensions/code-block/code-block.scss'

export interface NotionEditorProps {
  content?: string
  placeholder?: string
  onChange?: (html: string) => void
  onEditor?: (editor: Editor | null) => void
  editable?: boolean
  autofocus?: boolean
}

export function NotionEditor({
  content = '',
  placeholder = 'Type \'/\' for commands...',
  onChange,
  onEditor,
  editable = true,
  autofocus = false,
}: NotionEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedOnChange = useMemo(() => {
    return (html: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onChange?.(html)
      }, 300)
    }
  }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: 'notion-editor tiptap ProseMirror',
        spellcheck: 'false',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
        blockquote: false,
      }),
      CodeBlockExtension,
      BlockquoteExtension,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Underline,
      Image,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'paragraph') {
            return placeholder
          }
          return ''
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
        includeChildren: true,
      }),
      SlashCommandExtension,
      DragHandle,
    ],
    content,
    onUpdate: ({ editor }) => {
      debouncedOnChange(editor.getHTML())
    },
  })

  // Expose editor instance
  useEffect(() => {
    onEditor?.(editor)
  }, [editor, onEditor])

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [editor, content])

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      editor?.destroy()
    }
  }, [])

  if (!editor) {
    return null
  }

  return (
    <div className="notion-editor-wrapper">
      <BubbleMenuComponent editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
