import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

export interface DragHandleOptions {
  dragHandleClass: string
}

export const DragHandle = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      dragHandleClass: 'drag-handle',
    }
  },

  addProseMirrorPlugins() {
    const dragHandleClass = this.options.dragHandleClass
    let dragHandle: HTMLElement | null = null
    let currentNodePos: number | null = null
    let hideTimeout: ReturnType<typeof setTimeout> | null = null

    const createDragHandle = () => {
      const handle = document.createElement('div')
      handle.className = dragHandleClass
      handle.contentEditable = 'false'
      handle.draggable = true
      handle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/>
          <circle cx="15" cy="5" r="1.5"/>
          <circle cx="15" cy="12" r="1.5"/>
          <circle cx="15" cy="19" r="1.5"/>
        </svg>
      `
      return handle
    }

    const showDragHandle = (
      nodeElement: HTMLElement,
      nodePos: number,
      editorElement: HTMLElement
    ) => {
      // Clear any pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }

      if (!dragHandle) {
        dragHandle = createDragHandle()
        editorElement.parentElement?.appendChild(dragHandle)
      }

      const editorRect = editorElement.getBoundingClientRect()
      const nodeRect = nodeElement.getBoundingClientRect()
      const wrapperRect = editorElement.parentElement?.getBoundingClientRect()

      if (!wrapperRect) return

      dragHandle.style.position = 'absolute'
      dragHandle.style.top = `${nodeRect.top - wrapperRect.top}px`
      dragHandle.style.left = '0.25rem'
      dragHandle.style.opacity = '1'

      currentNodePos = nodePos
    }

    const hideDragHandle = (immediate = false) => {
      if (immediate) {
        if (dragHandle) {
          dragHandle.style.opacity = '0'
        }
        currentNodePos = null
        return
      }

      // Delay hiding to allow interaction with the handle
      hideTimeout = setTimeout(() => {
        if (dragHandle && !dragHandle.matches(':hover')) {
          dragHandle.style.opacity = '0'
          currentNodePos = null
        }
      }, 200)
    }

    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        view: (editorView) => {
          const editorElement = editorView.dom as HTMLElement
          const wrapper = editorElement.parentElement

          const getNodePosFromElement = (element: HTMLElement): number | null => {
            try {
              const pos = editorView.posAtDOM(element, 0)
              return pos
            } catch {
              return null
            }
          }

          const handleMouseMove = (event: MouseEvent) => {
            const target = event.target as HTMLElement

            // Don't process if hovering on the drag handle
            if (target.closest(`.${dragHandleClass}`)) {
              return
            }

            // Find the closest block element
            const blockElement = target.closest(
              'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, hr, li, [data-type="taskList"]'
            ) as HTMLElement | null

            if (blockElement && editorElement.contains(blockElement)) {
              const pos = getNodePosFromElement(blockElement)
              if (pos !== null) {
                showDragHandle(blockElement, pos, editorElement)
              }
            }
          }

          const handleMouseLeave = (event: MouseEvent) => {
            const relatedTarget = event.relatedTarget as HTMLElement
            // Don't hide if moving to the drag handle
            if (relatedTarget?.closest(`.${dragHandleClass}`)) {
              return
            }
            hideDragHandle()
          }

          const handleDragHandleMouseEnter = () => {
            if (hideTimeout) {
              clearTimeout(hideTimeout)
              hideTimeout = null
            }
          }

          const handleDragHandleMouseLeave = () => {
            hideDragHandle()
          }

          const handleDragStart = (event: DragEvent) => {
            if (currentNodePos === null) return

            try {
              const $pos = editorView.state.doc.resolve(currentNodePos)
              const depth = $pos.depth

              // Find the block node
              let blockPos = currentNodePos
              let blockNode = $pos.nodeAfter

              // If we're inside a node, find its parent block
              if (!blockNode || blockNode.isInline) {
                blockPos = $pos.before(depth)
                const $blockPos = editorView.state.doc.resolve(blockPos)
                blockNode = $blockPos.nodeAfter
              }

              if (!blockNode) return

              // Create a node selection
              const selection = NodeSelection.create(editorView.state.doc, blockPos)
              editorView.dispatch(editorView.state.tr.setSelection(selection))

              // Set drag data
              event.dataTransfer?.setData('text/plain', '')
              event.dataTransfer!.effectAllowed = 'move'

              // Let ProseMirror handle the drag
              editorView.dragging = {
                slice: editorView.state.doc.slice(blockPos, blockPos + blockNode.nodeSize),
                move: true,
              }
            } catch (e) {
              console.error('Drag start error:', e)
            }
          }

          const handleDragEnd = () => {
            // Clear the node selection after drag ends
            hideDragHandle(true)
          }

          const clearNodeSelection = () => {
            setTimeout(() => {
              try {
                if (editorView.state.selection instanceof NodeSelection) {
                  const pos = editorView.state.selection.from
                  const $pos = editorView.state.doc.resolve(pos)
                  const textSel = TextSelection.near($pos)
                  editorView.dispatch(editorView.state.tr.setSelection(textSel))
                }
              } catch {
                // Ignore errors
              }
            }, 10)
          }

          const handleDrop = () => {
            clearNodeSelection()
          }

          // Add event listeners
          editorElement.addEventListener('mousemove', handleMouseMove)
          editorElement.addEventListener('mouseleave', handleMouseLeave)
          editorElement.addEventListener('drop', handleDrop)

          // Create drag handle immediately and add its listeners
          dragHandle = createDragHandle()
          dragHandle.style.opacity = '0'
          wrapper?.appendChild(dragHandle)

          dragHandle.addEventListener('mouseenter', handleDragHandleMouseEnter)
          dragHandle.addEventListener('mouseleave', handleDragHandleMouseLeave)
          dragHandle.addEventListener('dragstart', handleDragStart)
          dragHandle.addEventListener('dragend', handleDragEnd)

          return {
            destroy: () => {
              editorElement.removeEventListener('mousemove', handleMouseMove)
              editorElement.removeEventListener('mouseleave', handleMouseLeave)
              editorElement.removeEventListener('drop', handleDrop)
              if (hideTimeout) {
                clearTimeout(hideTimeout)
              }
              if (dragHandle) {
                dragHandle.removeEventListener('mouseenter', handleDragHandleMouseEnter)
                dragHandle.removeEventListener('mouseleave', handleDragHandleMouseLeave)
                dragHandle.removeEventListener('dragstart', handleDragStart)
                dragHandle.removeEventListener('dragend', handleDragEnd)
                dragHandle.remove()
                dragHandle = null
              }
            },
          }
        },
      }),
    ]
  },
})
