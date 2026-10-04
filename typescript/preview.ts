const root = new URL("./demo/", import.meta.url);
const server = Bun.serve({
  port: 4173,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    if (relative.includes("..")) {
      return new Response("Not found", { status: 404 });
    }
    const file = Bun.file(new URL(relative, root));
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(file);
  },
});

console.log(server.url.href);
