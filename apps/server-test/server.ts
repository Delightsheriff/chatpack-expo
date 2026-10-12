import { createServer } from "node:http";
import { chatpack } from "@chatpack/core";
import { memoryAdapter } from "@chatpack/adapter-memory";
import { typing, presence, receipts } from "@chatpack/core/plugins";

const chat = chatpack({
  storage: memoryAdapter(),
  // DEMO ONLY: trust an x-user-id header. Real apps verify a session here.
  auth: (request) => {
    const userId = request.headers.get("x-user-id");
    return userId ? { id: userId } : null;
  },
  // Typing dots, online presence and ✓/✓✓ ticks for the Expo example.
  plugins: [typing(), presence(), receipts()],
});

const handler = chat.handler(); // basePath defaults to /api/chat
const PORT = Number(process.env.PORT ?? 3000);

// Node http <-> Web-standard Request/Response bridge.
const server = createServer(async (req, res) => {
  const url = `http://${req.headers.host ?? `localhost:${PORT}`}${req.url ?? "/"}`;
  console.log(`[server] ${req.method} ${req.url} x-user-id=${req.headers["x-user-id"] ?? "(none)"}`);
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = Buffer.concat(chunks);
  const request = new Request(url, {
    method: req.method ?? "GET",
    headers: Object.entries(req.headers).flatMap(([name, value]) =>
      value === undefined ? [] : Array.isArray(value) ? value.map((v): [string, string] => [name, v]) : ([[name, value]] as [string, string][]),
    ),
    body: body.length > 0 ? new Uint8Array(body) : null,
  });
  const response = await handler.fetch(request);
  console.log(`[server]   -> ${response.status}`);
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (response.body) {
    const reader = response.body.getReader();
    req.on("close", () => void reader.cancel().catch(() => {}));
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } catch {}
  }
  res.end();
});
server.listen(PORT, () => {
  console.log(`chatpack test server listening on http://localhost:${PORT}`);
});
