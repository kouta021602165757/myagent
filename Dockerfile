# MY AI AGENT — Render Docker image
# Provides Node 20 + system libraries needed by Playwright/Chromium so
# Chrome integration (browser tools) actually runs in production.
#
# To use: in Render dashboard, set the service "Environment" to "Docker".
# Render will build using this Dockerfile automatically.

FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copy package files first for cached deps
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Now copy the rest of the app
COPY . .

# The Playwright base image already has chromium installed; explicit install
# is a no-op but harmless.
RUN npx playwright install chromium --no-shell || true

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/index.js"]
