import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Safe markdown renderer for blog content (content is markdown, not HTML).
 * react-markdown does not render raw HTML by default, so this is XSS-safe.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="mt-8 text-3xl font-semibold" {...props} />,
          h2: ({ ...props }) => <h2 className="mt-8 text-2xl font-semibold" {...props} />,
          h3: ({ ...props }) => <h3 className="mt-6 text-xl font-semibold" {...props} />,
          p: ({ ...props }) => <p className="text-muted-foreground" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc space-y-1 pl-6 text-muted-foreground" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal space-y-1 pl-6 text-muted-foreground" {...props} />,
          a: ({ ...props }) => <a className="text-primary underline" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground" {...props} />
          ),
          img: ({ ...props }) => <img className="rounded-xl" loading="lazy" {...props} />,
          code: ({ ...props }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
