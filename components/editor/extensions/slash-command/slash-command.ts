import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import { ReactRenderer } from '@tiptap/react'
import { SlashCommandList, type SlashCommandListRef } from './slash-command-list'
import { slashCommands, type SlashCommand } from './commands'

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({
          editor,
          range,
          props,
        }: {
          editor: import('@tiptap/core').Editor
          range: { from: number; to: number }
          props: SlashCommand
        }) => {
          // Delete the slash command trigger
          editor.chain().focus().deleteRange(range).run()
          // Execute the command
          props.command(editor)
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          if (!query) return slashCommands

          const lowerQuery = query.toLowerCase()

          return slashCommands.filter((command) => {
            const matchTitle = command.title.toLowerCase().includes(lowerQuery)
            const matchAliases = command.aliases?.some((alias) =>
              alias.toLowerCase().includes(lowerQuery)
            )
            return matchTitle || matchAliases
          })
        },
        render: () => {
          let component: ReactRenderer<SlashCommandListRef> | null = null
          let popup: TippyInstance | null = null
          let currentEditor: import('@tiptap/core').Editor | null = null
          let suggestionRange: { from: number; to: number } | null = null

          const closeMenu = () => {
            popup?.hide()
            // Also dismiss the suggestion by deleting the trigger text
            if (currentEditor && suggestionRange) {
              currentEditor.chain().focus().deleteRange(suggestionRange).run()
            }
          }

          return {
            onStart: (props: {
              editor: import('@tiptap/core').Editor
              clientRect: (() => DOMRect | null) | null
              query: string
              range: { from: number; to: number }
              command: (command: SlashCommand) => void
            }) => {
              currentEditor = props.editor
              suggestionRange = props.range

              component = new ReactRenderer(SlashCommandList, {
                props: {
                  ...props,
                  command: (item: SlashCommand) => {
                    props.command(item)
                  },
                  onClose: closeMenu,
                },
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              const clientRectFn = props.clientRect

              popup = tippy(document.body, {
                getReferenceClientRect: () => clientRectFn() ?? new DOMRect(),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                offset: [0, 8],
              })
            },

            onUpdate: (props: {
              clientRect: (() => DOMRect | null) | null
              query: string
              range: { from: number; to: number }
              command: (command: SlashCommand) => void
            }) => {
              suggestionRange = props.range

              component?.updateProps({
                ...props,
                onClose: closeMenu,
              })

              if (!props.clientRect) {
                return
              }

              const clientRectFn = props.clientRect

              popup?.setProps({
                getReferenceClientRect: () => clientRectFn() ?? new DOMRect(),
              })
            },

            onKeyDown: (props: { event: KeyboardEvent }) => {
              return component?.ref?.onKeyDown(props) ?? false
            },

            onExit: () => {
              popup?.destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})
