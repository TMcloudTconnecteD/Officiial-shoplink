# Backend Dockerfile
FROM node:18-alpine

WORKDIR /backend

# Copy package.json and package-lock.json from the parent directory
COPY ../package.json ../package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "backend"]
