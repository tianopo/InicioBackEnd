# Etapa de build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de execução
FROM node:18
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "dist/main"]
