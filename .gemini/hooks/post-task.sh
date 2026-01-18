#!/bin/bash

# Arguments passed by Gemini
STATUS="$1"
SUMMARY="$2"
TIMESTAMP="$3"

# Derive topic from the current directory name with a suffix
TOPIC="$(basename "$PWD")_gemini_hook"

# Visual configuration based on status
if [[ "$STATUS" == "success" ]]; then
    TAG="white_check_mark"
    PRIORITY="default"
    HEADER="Task Completed Successfully"
else
    TAG="warning"
    PRIORITY="high"
    HEADER="Task Failed"
fi

# Send notification via ntfy.sh
# We use a POST request with headers for formatting
curl -s \
  -H "Title: $HEADER" \
  -H "Priority: $PRIORITY" \
  -H "Tags: $TAG" \
  -d "$SUMMARY

Time: $TIMESTAMP" \
  "https://ntfy.sh/$TOPIC"

echo "Notification sent to ntfy.sh/$TOPIC"
