'use client'

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { filterCommands, groupCommandsByCategory, type SlashCommand } from './commands'

import './slash-command.scss'

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

interface SlashCommandListProps {
  query: string
  command: (command: SlashCommand) => void
  onClose?: () => void
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ query, command, onClose }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const items = filterCommands(query)
    const groups = useMemo(() => groupCommandsByCategory(items), [items])

    // Flatten items for keyboard navigation
    const flatItems = useMemo(() => items, [items])

    const selectItem = useCallback(
      (index: number) => {
        const item = flatItems[index]
        if (item) {
          command(item)
        }
      },
      [flatItems, command]
    )

    useEffect(() => {
      setSelectedIndex(0)
    }, [query])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
          return true
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % flatItems.length)
          return true
        }

        if (event.key === 'Enter') {
          event.preventDefault()
          selectItem(selectedIndex)
          return true
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          onClose?.()
          return true
        }

        return false
      },
    }))

    // Get the index of an item in the flat list
    const getItemIndex = (item: SlashCommand) => {
      return flatItems.findIndex(i => i.title === item.title)
    }

    if (items.length === 0) {
      return (
        <div className="slash-menu">
          <div className="slash-menu-empty">No results</div>
          <div className="slash-menu-footer">
            <button className="slash-menu-close" onClick={onClose}>
              <span>Close menu</span>
              <kbd>esc</kbd>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="slash-menu">
        <div className="slash-menu-content">
          {groups.map((group) => (
            <div key={group.title} className="slash-menu-group">
              <div className="slash-menu-group-title">{group.title}</div>
              {group.items.map((item) => {
                const Icon = item.icon
                const index = getItemIndex(item)
                return (
                  <button
                    key={item.title}
                    className={cn(
                      'slash-menu-item',
                      index === selectedIndex && 'slash-menu-item--selected'
                    )}
                    onClick={() => selectItem(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon size={18} className="slash-menu-item-icon" />
                    <span className="slash-menu-item-title">{item.title}</span>
                    {item.shortcut && (
                      <span className="slash-menu-item-shortcut">{item.shortcut}</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="slash-menu-footer">
          <button className="slash-menu-close" onClick={onClose}>
            <span>Close menu</span>
            <kbd>esc</kbd>
          </button>
        </div>
      </div>
    )
  }
)

SlashCommandList.displayName = 'SlashCommandList'
