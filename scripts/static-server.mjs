import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 5174);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const relative = cleanUrl === "/" ? "index.html" : cleanUrl.slice(1);
  const file = normalize(join(root, relative));
  if (!file.startsWith(root)) return null;
  return file;
}

const server = createServer(async (request, response) => {
  const file = resolvePath(request.url || "/");
  if (!file || !existsSync(file)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const info = await stat(file);
  if (info.isDirectory()) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  response.writeHead(200, {
    "Content-Type": types[extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": info.size,
  });
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Cat house preview: http://${host}:${port}/`);
});
