FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV BACKEND_URL=http://backend:4000
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
