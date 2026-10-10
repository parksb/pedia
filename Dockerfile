ARG DENO_VERSION=2.9.7
FROM denoland/deno:${DENO_VERSION} AS build

WORKDIR /app

COPY deno.json deno.lock ./
COPY app/ ./app/
RUN deno cache --frozen app/main.ts

COPY assets/ ./assets/
RUN deno bundle --frozen --minify -o assets/index.js app/client/index.ts

FROM denoland/deno:${DENO_VERSION} AS runtime

WORKDIR /app

ENV DENO_NO_UPDATE_CHECK=1

COPY --from=build /deno-dir/ /deno-dir/
COPY --from=build /app/ /app/
COPY public/ ./public/
COPY docs/ ./docs/
COPY simpesys.metadata.json LICENSE ./
COPY tools/healthcheck.ts ./tools/healthcheck.ts

USER deno
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD ["deno", "task", "healthcheck"]

CMD ["deno", "task", "start"]
