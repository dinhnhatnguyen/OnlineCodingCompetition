FROM node:16-slim

WORKDIR /app
COPY entrypointJs.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN mkdir -p /app/code

ENTRYPOINT ["/app/entrypoint.sh"]
