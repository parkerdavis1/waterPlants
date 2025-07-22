# Not enough memory to build, so rsyncing builds in 

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=24.4.1
FROM node:${NODE_VERSION}-slim AS base

# SvelteKit app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=latest-10
RUN npm install -g pnpm@$PNPM_VERSION

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=true


FROM base AS development
COPY build /app/build
COPY .env.localdocker /app/.env
# Start the server by default, this can be overwritten at runtime
CMD [ "pnpm", "run", "start" ]

FROM base AS production
# Copy built application
COPY build /app/build
COPY .env.prod /app/.env
# Start the server by default, this can be overwritten at runtime
CMD [ "pnpm", "run", "start" ]
