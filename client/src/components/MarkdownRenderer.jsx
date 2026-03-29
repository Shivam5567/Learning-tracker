import React from 'react';
import { marked } from 'marked';

// Configure marked for safe links and common GFM-like behavior
marked.setOptions({
  breaks: true,
  headerIds: false,
  mangle: false
});

/**
 * A shared Markdown rendering component with standard Tailwind typography styling.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const html = marked.parse(content);

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
