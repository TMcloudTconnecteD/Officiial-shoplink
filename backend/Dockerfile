# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Add wait-for script to handle startup order
ADD https://raw.githubusercontent.com/eficode/wait-for/master/wait-for /wait-for
RUN chmod +x /wait-for

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Set NODE_ENV and other environment variables
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=1
ENV NODE_OPTIONS="--tls-cipher-list=TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256"

EXPOSE 8000

# Use a script to handle startup
COPY ./scripts/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
