FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node server.js ./

ENV NODE_ENV=dev
ENV PORT=3000

USER node

EXPOSE 3000

CMD ["npm", "start"]