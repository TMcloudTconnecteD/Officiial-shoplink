# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app/backend

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "backend"]
