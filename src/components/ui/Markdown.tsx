import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Simple Markdown renderer for chat messages
 * Supports: **bold**, *italic*, `code`, ```code blocks```, - lists, numbered lists
 */
export function Markdown({ content, className = '' }: MarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let listItems: React.ReactNode[] = [];
  let isInList = false;
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      isInList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-dark-900 rounded-lg p-3 my-2 overflow-x-auto text-xs"
          >
            <code className="text-accent-green">{codeBlockContent.join('\n')}</code>
          </pre>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        // Start code block
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Unordered list (- or *)
    const ulMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!isInList || listType !== 'ul') {
        flushList();
        isInList = true;
        listType = 'ul';
      }
      listItems.push(
        <li key={`li-${i}`} className="text-dark-200">
          {parseInline(ulMatch[1])}
        </li>
      );
      continue;
    }

    // Ordered list (1. 2. etc)
    const olMatch = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (!isInList || listType !== 'ol') {
        flushList();
        isInList = true;
        listType = 'ol';
      }
      listItems.push(
        <li key={`li-${i}`} className="text-dark-200">
          {parseInline(olMatch[2])}
        </li>
      );
      continue;
    }

    // If we were in a list and now we're not
    if (isInList && line.trim() !== '') {
      flushList();
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Heading (## or ###)
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      flushList();
      elements.push(
        <h4 key={`h2-${i}`} className="text-white font-semibold mt-3 mb-1">
          {parseInline(h2Match[1])}
        </h4>
      );
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      flushList();
      elements.push(
        <h5 key={`h3-${i}`} className="text-white font-medium mt-2 mb-1">
          {parseInline(h3Match[1])}
        </h5>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-dark-200">
        {parseInline(line)}
      </p>
    );
  }

  // Flush any remaining list
  flushList();

  // Handle unclosed code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre key="code-final" className="bg-dark-900 rounded-lg p-3 my-2 overflow-x-auto text-xs">
        <code className="text-accent-green">{codeBlockContent.join('\n')}</code>
      </pre>
    );
  }

  return <div className={`markdown-content ${className}`}>{elements}</div>;
}

/**
 * Parse inline markdown: **bold**, *italic*, `code`
 */
function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="text-white font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic text-dark-300">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          className="bg-dark-900 text-accent-green px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/[*`]/);
    if (nextSpecial === -1) {
      // No more special characters
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Special character at start but didn't match patterns above
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      // Text before special character
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

