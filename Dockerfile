# Étape de build pour le frontend React
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape finale d'exécution Node.js / Express
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev

# Copie du build frontend et du serveur backend
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY tasks.json ./tasks.json

EXPOSE 8080

CMD ["npm", "start"]
