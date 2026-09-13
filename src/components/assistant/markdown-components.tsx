import type { Components } from "react-markdown";

/**
 * Safe, minimal styling for assistant answers. No raw HTML is enabled and no
 * dangerouslySetInnerHTML is used anywhere (react-markdown builds a React
 * tree directly). Links are opened safely, and images are rendered as plain
 * links rather than embedded remote images.
 */
export const markdownComponents: Components = {
  p: ({ node: _node, ...props }) => <p className="mb-2 text-sm break-words text-zinc-800 last:mb-0" {...props} />,
  h1: ({ node: _node, ...props }) => <h3 className="mt-3 mb-1 text-base font-semibold text-zinc-900 first:mt-0" {...props} />,
  h2: ({ node: _node, ...props }) => <h4 className="mt-3 mb-1 text-sm font-semibold text-zinc-900 first:mt-0" {...props} />,
  h3: ({ node: _node, ...props }) => <h5 className="mt-2 mb-1 text-sm font-semibold text-zinc-900 first:mt-0" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="mb-2 ml-5 list-disc text-sm text-zinc-800" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="mb-2 ml-5 list-decimal text-sm text-zinc-800" {...props} />,
  li: ({ node: _node, ...props }) => <li className="mb-1" {...props} />,
  strong: ({ node: _node, ...props }) => <strong className="font-semibold text-zinc-900" {...props} />,
  em: ({ node: _node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="mb-2 border-l-2 border-zinc-200 pl-3 text-sm text-zinc-600 italic" {...props} />
  ),
  hr: ({ node: _node, ...props }) => <hr className="my-3 border-zinc-200" {...props} />,
  a: ({ node: _node, href, children, ...props }) => {
    const safeHref = typeof href === "string" && /^https?:\/\//i.test(href) ? href : undefined;
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="break-words text-zinc-900 underline underline-offset-2"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => {
    // Render as a text link instead of an embedded remote image.
    if (typeof src !== "string") return null;
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="break-words text-zinc-900 underline">
        {alt || src}
      </a>
    );
  },
  code: ({ node: _node, className, children, ...props }) => (
    <code className={`rounded bg-zinc-100 px-1 py-0.5 text-xs break-words ${className ?? ""}`} {...props}>
      {children}
    </code>
  ),
  pre: ({ node: _node, ...props }) => (
    <pre className="mb-2 overflow-x-auto rounded-md bg-zinc-100 p-3 text-xs" {...props} />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="mb-2 overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-xs" {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }) => <thead className="border-b border-zinc-200 text-zinc-500" {...props} />,
  th: ({ node: _node, ...props }) => <th className="px-2 py-1 font-medium" {...props} />,
  td: ({ node: _node, ...props }) => <td className="border-t border-zinc-100 px-2 py-1 text-zinc-800" {...props} />,
};
