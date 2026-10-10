const response = await fetch("http://127.0.0.1:8000/api/health", {
  signal: AbortSignal.timeout(3000),
});

if (!response.ok || await response.text() !== "ok") {
  Deno.exit(1);
}
