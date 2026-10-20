FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY sql ./sql

RUN npm run build


FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/sql ./sql

EXPOSE 3000

CMD ["node", "dist/server.js"]