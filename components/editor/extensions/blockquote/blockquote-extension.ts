import { Blockquote } from '@tiptap/extension-blockquote'

export const BlockquoteExtension = Blockquote.extend({
  addKeyboardShortcuts() {
    return {
      // Enter exits blockquote
      Enter: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // Check if we're in a blockquote
        const blockquote = $from.node(-1)
        if (blockquote?.type.name !== 'blockquote') {
          return false
        }

        // Check if current paragraph is empty
        const currentNode = $from.parent
        if (currentNode.content.size === 0) {
          // Exit blockquote - delete the empty paragraph and create new one outside
          return editor
            .chain()
            .lift('blockquote')
            .run()
        }

        // If not empty, exit blockquote and create new paragraph
        return editor
          .chain()
          .insertContentAt($from.after(-1), { type: 'paragraph' })
          .focus($from.after(-1) + 1)
          .run()
      },
    }
  },
})
