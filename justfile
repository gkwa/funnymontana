set shell := ["bash", "-uc"]

default:
    @just --list

install:
    pnpm install
    pnpm exec playwright install-deps
    pnpm exec playwright install

fetch URL:
    mkdir -p tmp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S) && \
    pnpm start {{ URL }} && \
    mv tmp/*-processed.html tmp/${TIMESTAMP}_fetched.html && \
    echo ${TIMESTAMP} > tmp/latest_timestamp

fetch-visible URL:
    mkdir -p tmp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S) && \
    HEADLESS=false pnpm start {{ URL }} && \
    mv tmp/*-processed.html tmp/${TIMESTAMP}_fetched.html && \
    echo ${TIMESTAMP} > tmp/latest_timestamp

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

copy-to-clipboard URL:
    #!/usr/bin/env bash
    TIMESTAMP=$(cat tmp/latest_timestamp)
    MARKDOWN_FILE="tmp/${TIMESTAMP}_processed.md"
    TMP_FILE="tmp/${TIMESTAMP}_tmp"
    if [ ! -f "$MARKDOWN_FILE" ]; then
        echo "Error: Markdown file $MARKDOWN_FILE not found"
        exit 1
    fi
    pnpm exec ts-node -e "import { generateTemplate } from './utils'; generateTemplate('{{ URL }}', '$MARKDOWN_FILE', '$TMP_FILE')"
    cat $TMP_FILE | pbcopy
    echo "Markdown content with preamble copied to clipboard."

pipeline URL:
    just fetch {{ URL }}
    just html-to-md
    just copy-to-clipboard {{ URL }}
    @echo "Pipeline completed. Output files:"
    @TIMESTAMP=$(cat tmp/latest_timestamp) && \
    echo "  Fetched HTML:    tmp/${TIMESTAMP}_fetched.html ($(du -h tmp/${TIMESTAMP}_fetched.html | cut -f1))" && \
    echo "  Processed MD:    tmp/${TIMESTAMP}_processed.md ($(du -h tmp/${TIMESTAMP}_processed.md | cut -f1))"
    @echo "Markdown content with preamble has been copied to clipboard."

clean:
    rm -rf tmp

format:
    npx prettier --write .
    just --unstable --fmt

tsc:
    npx tsc --noEmit

lint:
    npx eslint .

check: format tsc lint
