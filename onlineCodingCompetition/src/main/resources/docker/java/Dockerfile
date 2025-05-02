FROM openjdk:17-slim

WORKDIR /app
COPY entrypointJava.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN mkdir -p /app/code

ENTRYPOINT ["/app/entrypoint.sh"]