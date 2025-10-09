#!/usr/bin/env bash

# Author: @ralfhandl

# Run this script from the root of the repo

SCHEMA_FILE="src/schemas/validation/schema.yaml"
TEST_DIR="tests/schema/pass"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "[schema-test-coverage] Skipping: Schema file not found at $SCHEMA_FILE"
  exit 0
fi

if [ ! -d "$TEST_DIR" ]; then
  echo "[schema-test-coverage] Skipping: Test folder not found at $TEST_DIR"
  exit 0
fi

node scripts/schema-test-coverage.mjs "$SCHEMA_FILE" "$TEST_DIR"