# Define output file names

set shell := ["bash", "-uc"]

# Define clipboard content template

instructions_start := "<instructions>"
instructions_body := '''
Convert the html to markdown.

Please make a few transformations along the way:


1. Put the title of the page on a separate line at the top 
of the file.  Please don't add this title as a header.  Instead
just add it without formatting on a line all by itself.

1. Put a markdown link to the original article at the top
of the page using standard markdown format [title](url). 

1. In the process of converting, change formatting such that each
sentence is a new paragraph.  This helps comprehension.

1. When formatting code blocks please label the code block with the
name of the language.


1. Make sure to keep all links to external images or to github gists 
or code blocks.

So for example, if you find image links like this:
<img src="https://miro.medium.com/v2/resize:fit:577/1*wlWUTYxYuNl5v7DX6KnmYQ.jpeg" />

You should include them into the result like this:
![](https://miro.medium.com/v2/resize:fit:577/1*wlWUTYxYuNl5v7DX6KnmYQ.jpeg)

1. Relative links should be converted to absolute links. 
You can do this because I've provided the original url here:
'''
instructions_end := "</instructions>"

# List all available commands
default:
    @just --list

# Install project dependencies
install:
    pnpm install

# Run the URL fetcher (headless mode)
fetch URL:
    mkdir -p tmp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S) && \
    pnpm start {{ URL }} && \
    mv tmp/*-processed.html tmp/${TIMESTAMP}_fetched.html && \
    echo ${TIMESTAMP} > tmp/latest_timestamp

# Run the URL fetcher with visible browser
fetch-visible URL:
    mkdir -p tmp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S) && \
    HEADLESS=false pnpm start {{ URL }} && \
    mv tmp/*-processed.html tmp/${TIMESTAMP}_fetched.html && \
    echo ${TIMESTAMP} > tmp/latest_timestamp

# Process the fetched HTML file with Pandoc to Markdown
html-to-md:
    #!/usr/bin/env bash
    set -e
    TIMESTAMP=$(cat tmp/latest_timestamp)
    INPUT_FILE="tmp/${TIMESTAMP}_fetched.html"
    OUTPUT_FILE="tmp/${TIMESTAMP}_processed.md"
    if [ ! -f "$INPUT_FILE" ]; then
        echo "Error: Input file $INPUT_FILE not found"
        exit 1
    fi
    pandoc "$INPUT_FILE" --from=html --to=gfm -o "$OUTPUT_FILE"
    if [ ! -f "$OUTPUT_FILE" ]; then
        echo "Error: Output file $OUTPUT_FILE was not created"
        exit 1
    fi
    echo "Processed Markdown file created: $OUTPUT_FILE"

# Copy processed Markdown to clipboard with preamble
copy-to-clipboard URL:
    #!/usr/bin/env bash
    TIMESTAMP=$(cat tmp/latest_timestamp)
    MARKDOWN_FILE="tmp/${TIMESTAMP}_processed.md"
    TMP_FILE="tmp/${TIMESTAMP}_tmp"
    if [ ! -f "$MARKDOWN_FILE" ]; then
        echo "Error: Markdown file $MARKDOWN_FILE not found"
        exit 1
    fi
    {
        echo "{{ instructions_start }}"
        echo "{{ instructions_body }}"
        echo "{{ URL }}"
        echo "{{ instructions_end }}"
        echo 
        echo
        cat "$MARKDOWN_FILE"
    } >$TMP_FILE
    echo debug: $TMP_FILE
    cat $TMP_FILE | pbcopy
    echo "Markdown content with preamble copied to clipboard."

# Run the complete pipeline
pipeline URL:
    just fetch {{ URL }}
    just html-to-md
    just copy-to-clipboard {{ URL }}
    @echo "Pipeline completed. Output files:"
    @TIMESTAMP=$(cat tmp/latest_timestamp) && \
    echo "  Fetched HTML:    tmp/${TIMESTAMP}_fetched.html ($(du -h tmp/${TIMESTAMP}_fetched.html | cut -f1))" && \
    echo "  Processed MD:    tmp/${TIMESTAMP}_processed.md ($(du -h tmp/${TIMESTAMP}_processed.md | cut -f1))"
    @echo "Markdown content with preamble has been copied to clipboard."

# Clean the tmp directory
clean:
    rm -rf tmp

# Format code with Prettier
format:
    npx prettier --write .
    just --unstable --fmt

# Run TypeScript compiler
tsc:
    npx tsc --noEmit

# Lint code with ESLint
lint:
    npx eslint .

# Run all checks (format, tsc, lint)
check: format tsc lint
