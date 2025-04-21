import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const CustomMarkdown = ({ content }: { content: string }) => (
  <Markdown
    components={{
      pre: ({ node, ...props }) => (
        <pre className="whitespace-pre-wrap break-words" {...props} />
      ),
      code({ node, className = "", children, ...props }) {
        const match = /language-(\w+)/.exec(className);
        return match ? (
          <SyntaxHighlighter
            PreTag="div"
            className="rounded-md"
            language={match[1]}
            style={vscDarkPlus}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {content}
  </Markdown>
);
