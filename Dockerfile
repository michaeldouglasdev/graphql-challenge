FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn codegen

RUN yarn build || echo "No build script found, skipping build step"

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/graphql', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["yarn", "dev"]
