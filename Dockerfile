FROM denoland/deno:2.3.1

WORKDIR /app

COPY deno.json deno.json
COPY deno.lock deno.lock
RUN deno install

COPY . .

CMD ["deno", "run", "start"]
