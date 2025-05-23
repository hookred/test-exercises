import React from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import rehypeKatex from 'rehype-katex'; // Plugin for rendering math with KaTeX
import rehypeRaw from 'rehype-raw'; // Plugin to allow HTML in markdown (use with caution)
import remarkMath from 'remark-math'; // Plugin for parsing math

interface MarkdownRendererProps {
  markdownContent: string; // The markdown string to render
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
  return (
    <div className="markdown-body"> {/* Optional: Add a class for styling */}
      <ReactMarkdown
        // Use the plugins for parsing and rendering math
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]} // rehypeRaw allows HTML, use with caution
        // You can add custom components to render specific markdown elements
        // components={{
        //   h1: ({ node, ...props }) => <h1 className="text-2xl font-bold" {...props} />,
        //   p: ({ node, ...props }) => <p className="mb-4" {...props} />,
        //   // Add more custom components as needed
        // }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
