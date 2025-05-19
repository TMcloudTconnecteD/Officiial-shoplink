# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Add wait-for script to handle startup order
ADD https://raw.githubusercontent.com/eficode/wait-for/master/wait-for /wait-for
RUN chmod +x /wait-for

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Set NODE_ENV
ENV NODE_ENV=production

EXPOSE 8000

# Use a script to handle startup
COPY ./scripts/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
