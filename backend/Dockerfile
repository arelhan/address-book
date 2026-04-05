FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
