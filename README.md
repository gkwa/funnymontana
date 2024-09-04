

# funnymontana




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