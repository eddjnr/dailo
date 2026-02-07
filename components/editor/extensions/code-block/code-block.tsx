/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useState, useCallback, useRef } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Copy, Check } from 'lucide-react'

import './code-block.scss'

interface CodeBlockProps {
  node: {
    attrs: { language?: string }
    textContent: string
  }
}

export function CodeBlockComponent({ node }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const copyCode = useCallback(() => {
    const text = node.textContent || preRef.current?.textContent || ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [node.textContent])

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-language">
          {node.attrs.language || 'plain text'}
        </span>
        <button
          type="button"
          className="code-block-copy"
          onClick={copyCode}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="code-block-content">
        {/* @ts-expect-error */}
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}
