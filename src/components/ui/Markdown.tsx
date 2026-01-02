import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Markdown renderer using react-markdown
 * Supports full markdown syntax with custom styling
 */
export function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold text-white mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-white mt-2 mb-1">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h4>
        ),
        
        // Paragraph
        p: ({ children }) => (
          <p className="text-dark-200 mb-2 last:mb-0">{children}</p>
        ),
        
        // Bold & Italic
        strong: ({ children }) => (
          <strong className="text-white font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-dark-300">{children}</em>
        ),
        
        // Code
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-dark-900 text-accent-green px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className={`text-accent-green ${className || ''}`} {...props}>
              {children}
            </code>
          );
        },
        
        // Code block
        pre: ({ children }) => (
          <pre className="bg-dark-900 rounded-lg p-3 my-2 overflow-x-auto text-xs">
            {children}
          </pre>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 my-2 text-dark-200">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-2 text-dark-200">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-dark-200">{children}</li>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent-green hover:underline"
          >
            {children}
          </a>
        ),
        
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent-green pl-3 my-2 text-dark-300 italic">
            {children}
          </blockquote>
        ),
        
        // Horizontal rule
        hr: () => <hr className="border-dark-600 my-3" />,
        
        // Table
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-dark-700">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-dark-700">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr>{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-white font-medium">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-dark-200">{children}</td>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
