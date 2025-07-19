import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  allowedHTMLElements,
  parseMarkdownIntoBlocks,
  rehypePlugins,
  remarkPlugins,
} from "./utils";

export const MemoizedMarkdownBlock = memo(
  function MemoizedMarkdownBlock({ content }: { content: string }) {
    return (
      <ReactMarkdown
        allowedElements={allowedHTMLElements}
        remarkPlugins={remarkPlugins(false)}
        rehypePlugins={rehypePlugins(true)}
        components={{
          // Ensure proper styling for common elements
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside mb-4 space-y-1 pl-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside mb-4 space-y-1 pl-6">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          p: ({ children }) => <p className="">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="text-white bg-background rounded overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-gray-300" />,
          table: ({ children }) => (
            <table className="w-full border-collapse border border-gray-300 mb-4">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  }
);

// Create a wrapper component for lazy loading
export const LazyMarkdown = ({
  content,
  id,
}: {
  content: string;
  id: string;
}) => {
  return <MemoizedMarkdown content={content} id={id} />;
};

// Default export for lazy loading
export default LazyMarkdown;
