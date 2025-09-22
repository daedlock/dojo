import { Markdown } from '@/components/ui/markdown'

const testMarkdown = `
# Code Block Testing

This page demonstrates markdown rendering with syntax highlighting.

## Assembly Example

\`\`\`assembly
mov rax, 42
syscall
\`\`\`

## JavaScript Example

\`\`\`javascript
function test() {
  return "hello";
}
\`\`\`

## Simple Test

Here's some inline code: \`const x = 42;\`.
`

export default function MarkdownTest() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Markdown>{testMarkdown}</Markdown>
      </div>
    </div>
  )
}
