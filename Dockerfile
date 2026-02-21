# Single image: API + frontend (Rush monorepo)
# Build: docker build -t albion-map .
# Run:   docker run -p 4000:4000 -e MONGODB_URI="..." albion-map
# Then open http://localhost:4000 for the app (API at /api).

FROM node:20-alpine

# Rush uses Git for repo state analysis (optional but avoids "Git is not present" in logs)
RUN apk add --no-cache git

WORKDIR /app

COPY . .

# Build both server and client via Rush
RUN node common/scripts/install-run-rush.js install && \
    node common/scripts/install-run-rush.js build --to albion-map-server && \
    node common/scripts/install-run-rush.js build --to albion-map-client && \
    cp -r client/dist server/public

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server/dist/index.js"]
