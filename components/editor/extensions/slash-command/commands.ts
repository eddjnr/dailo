import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image,
  Minus,
  Type,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'
import type { LucideIcon } from 'lucide-react'

export interface SlashCommand {
  title: string
  description?: string
  icon: LucideIcon
  command: (editor: Editor) => void
  aliases?: string[]
  shortcut?: string
  category: 'suggested' | 'basic' | 'media' | 'advanced'
}

export const slashCommands: SlashCommand[] = [
  // Suggested
  {
    title: 'Text',
    icon: Type,
    aliases: ['p', 'paragraph'],
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().setParagraph().run()
    },
  },
  {
    title: 'Heading 1',
    icon: Heading1,
    aliases: ['h1', 'heading1', 'title'],
    shortcut: '#',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    aliases: ['h2', 'heading2', 'subtitle'],
    shortcut: '##',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    icon: Heading3,
    aliases: ['h3', 'heading3'],
    shortcut: '###',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
  },
  {
    title: 'Bulleted list',
    icon: List,
    aliases: ['ul', 'unordered', 'bullet'],
    shortcut: '-',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    title: 'Numbered list',
    icon: ListOrdered,
    aliases: ['ol', 'ordered', 'number'],
    shortcut: '1.',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
  {
    title: 'To-do list',
    icon: CheckSquare,
    aliases: ['todo', 'checkbox', 'task'],
    shortcut: '[]',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run()
    },
  },
  {
    title: 'Quote',
    icon: Quote,
    aliases: ['blockquote', 'quotation'],
    shortcut: '>',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run()
    },
  },
  {
    title: 'Divider',
    icon: Minus,
    aliases: ['hr', 'horizontal', 'separator', 'line'],
    shortcut: '---',
    category: 'basic',
    command: (editor) => {
      editor.chain().focus().setHorizontalRule().run()
    },
  },
  {
    title: 'Code block',
    icon: Code,
    aliases: ['codeblock', 'pre', 'snippet'],
    shortcut: '```',
    category: 'advanced',
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run()
    },
  },
  // {
  //   title: 'Image',
  //   icon: Image,
  //   aliases: ['img', 'picture', 'photo'],
  //   category: 'media',
  //   command: (editor) => {
  //     const url = window.prompt('Enter image URL')
  //     if (url) {
  //       editor.chain().focus().setImage({ src: url }).run()
  //     }
  //   },
  // },
]

export function filterCommands(query: string): SlashCommand[] {
  if (!query) return slashCommands

  const lowerQuery = query.toLowerCase()

  return slashCommands.filter((command) => {
    const matchTitle = command.title.toLowerCase().includes(lowerQuery)
    const matchAliases = command.aliases?.some((alias) =>
      alias.toLowerCase().includes(lowerQuery)
    )
    return matchTitle || matchAliases
  })
}

export function groupCommandsByCategory(commands: SlashCommand[]) {
  const groups: { title: string; items: SlashCommand[] }[] = []

  const basic = commands.filter(c => c.category === 'basic')
  const advanced = commands.filter(c => c.category === 'advanced')
  const media = commands.filter(c => c.category === 'media')

  if (basic.length > 0) {
    groups.push({ title: 'Basic blocks', items: basic })
  }
  if (advanced.length > 0) {
    groups.push({ title: 'Advanced', items: advanced })
  }
  if (media.length > 0) {
    groups.push({ title: 'Media', items: media })
  }

  return groups
}
