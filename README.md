# funnymontana

## Motivation

Often I'll read a web page and want to copy it to my notes, annotate, and ask questions to Claude.ai regarding the content. This tool simplifies that process.

Running:

```
just pipeline https://medium.com/box-tech-blog/creating-cloud-managed-platform-services-93a52233c8a9
```

1. Downloads the page
1. Reduce the html file size in any way possible so that we can feed it back into Claude.ai without getting rate limited. It seems converting the file to markdown using pandoc helps.
1. Adds prompt instructions to convert relative links to absolute so links render (in Obsidian)
1. Adds prompt instructions to convert each sentence to a new paragraph for easier readability
1. Copies the result to the clipboard

I then paste that back into the Claude.ai prompt. This makes it much easier to feed content into Claude.ai for analysis and discussion.

## Installation

```bash
eval "$(just --completions bash 2>/dev/null)"
just # show rules
just install
```

## Usage

Example: run the pipeline:

```bash
just pipeline https://medium.com/box-tech-blog/creating-cloud-managed-platform-services-93a52233c8a9
```

Or run steps individually:

```bash
just fetch URL
just html-to-md
just copy-to-clipboard URL
```

Clean up:

```bash
just clean
```

## Cheatsheet

```bash
just install          # Install project dependencies
just                  # List available rules
just fetch URL        # Fetch content from URL
just html-to-md       # Convert HTML to Markdown
just copy-to-clipboard URL  # Copy processed content to clipboard
just pipeline URL     # Run full pipeline (fetch, convert, copy)
just clean            # Clean tmp directory
just format           # Format code
just tsc              # Run TypeScript compiler
just lint             # Lint code
just check            # Run all checks (format, tsc, lint)
```

## Dependencies

- [just](https://github.com/casey/just?tab=readme-ov-file#just): Command runner for project-specific tasks
- [pandoc](https://github.com/jgm/pandoc?tab=readme-ov-file#pandoc): Universal document converter
- [Obsidian](https://obsidian.md/download): Note-taking app
- [pnpm](https://pnpm.io)
