import { CodeBlock } from '@tiptap/extension-code-block'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CodeBlockComponent } from './code-block'

export const CodeBlockExtension = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
})
