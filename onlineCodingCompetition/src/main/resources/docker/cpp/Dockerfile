FROM gcc:11.2.0

WORKDIR /app
COPY entrypointCpp.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

RUN mkdir -p /app/code


ENTRYPOINT ["/app/entrypoint.sh"]