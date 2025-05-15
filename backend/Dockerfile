# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy only backend package manifests
COPY package.json package-lock.json ./
RUN npm install

# Copy backend source code
COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
