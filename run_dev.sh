#!/usr/bin/env sh
set -e
[ -f .env ] || cp .env.example .env
npm install
npm run dev
