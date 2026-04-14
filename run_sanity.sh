#!/bin/bash
cd "/home/seb/Documents/PRAGMA E2E"
npx playwright test --grep @sanity --project=chromium
