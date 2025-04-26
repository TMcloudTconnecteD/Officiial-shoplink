# Frontend Dockerfile
FROM node:18-alpine AS build

WORKDIR /app/frontend/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ .

RUN ls -la /app/frontend/frontend

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/frontend/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
