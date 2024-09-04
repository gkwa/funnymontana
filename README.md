# funnymontana

## Motivation

Often I'll read a web page and want to copy it to my notes, annotate, and ask questions to Claude.ai regarding the content. This tool simplifies that process.

Running:
```
just pipeline https://medium.com/box-tech-blog/creating-cloud-managed-platform-services-93a52233c8a9
```

1. Downloads the page
2. Converts it to markdown using pandoc, which significantly reduces the content size
3. Adds prompt instructions to convert relative links to absolute so links render (in Obsidian)
4. Adds prompt instructions to convert each sentence to a new paragraph for easier readability
5. Copies the result to your clipboard

You can then paste that back into the Claude.ai prompt. This makes it much easier to feed content into Claude.ai for analysis and discussion.

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

- Install: `just install`
- List rules: `just`
- Fetch URL: `just fetch URL`
- Convert HTML to Markdown: `just html-to-md`
- Copy to clipboard: `just copy-to-clipboard URL`
- Run full pipeline: `just pipeline URL`
- Clean tmp directory: `just clean`
- Format code: `just format`
- Run TypeScript compiler: `just tsc`
- Lint code: `just lint`
- Run all checks: `just check`

## Dependencies

- [just](https://github.com/casey/just?tab=readme-ov-file#just): Command runner for project-specific tasks
- [pandoc](https://github.com/jgm/pandoc?tab=readme-ov-file#pandoc): Universal document converter
- [Obsidian](https://obsidian.md/download): Note-taking app
