FROM python:3.9-slim

WORKDIR /app
COPY entrypointPython.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN mkdir -p /app/code

ENTRYPOINT ["/app/entrypoint.sh"]