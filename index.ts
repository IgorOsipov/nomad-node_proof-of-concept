import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const app = express();
const port = 3000;
const server = createServer(app);

// Включаем WebSocket только в режиме разработки
const isDevelopment = process.env.NODE_ENV !== "production";
const wss = isDevelopment ? new WebSocketServer({ server }) : null;

// WebSocket connections
const clients = new Set();

if (isDevelopment && wss) {
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });
}

// Функция для отправки сигнала перезагрузки всем клиентам
const notifyClients = () => {
  if (!isDevelopment) return;

  clients.forEach((client) => {
    try {
      (client as any).send("reload");
    } catch (e) {
      console.error("Failed to send reload signal:", e);
    }
  });
};

interface ManifestEntry {
  file: string;
  css?: string[];
  imports?: string[];
}

interface Manifest {
  [key: string]: ManifestEntry;
}

// Кэш манифеста, обновляется при каждом запросе если файл изменился
let manifestCache: Manifest | null = null;

const readManifest = (): Manifest | null => {
  try {
    return JSON.parse(
      readFileSync(join(process.cwd(), "dist", "manifest.json"), "utf-8")
    );
  } catch (e) {
    console.error("Failed to read manifest:", e);
    return null;
  }
};

const readIndexHtml = (): string => {
  try {
    return readFileSync(join(process.cwd(), "index.html"), "utf-8");
  } catch (e) {
    console.error("Failed to read index.html:", e);
    return "";
  }
};

// Добавляем скрипт для live-reload только в режиме разработки
const liveReloadScript = isDevelopment
  ? `
<script>
  (function() {
    const ws = new WebSocket('ws://localhost:${port}');
    ws.onmessage = function(event) {
      if (event.data === 'reload') {
        console.log('Reloading page...');
        window.location.reload();
      }
    };
    ws.onclose = function() {
      console.log('Live reload connection closed. Reconnecting...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };
  })();
</script>
`
  : "";

app.get("/:app", (req: Request, res: Response) => {
  // Обновляем кэш при каждом запросе
  const manifest = manifestCache ?? readManifest();

  if (!manifest) {
    return res.status(500).send("Manifest not found");
  }
  manifestCache = manifest;
  const appName = req.params.app;

  const appManifest = manifest[`src/apps/${appName}/main.ts`];

  if (!appManifest) {
    return res.status(404).send("App not found");
  }

  let html = readIndexHtml();
  if (!html) {
    return res.status(500).send("Index.html not found");
  }

  // Добавляем CSS перед закрывающим тегом head
  if (appManifest.css?.[0]) {
    html = html.replace(
      "%STYLES%",
      `<link rel="stylesheet" href="/${appManifest.css[0]}">`
    );
  }

  // Добавляем live-reload скрипт и основной скрипт приложения
  html = html.replace(
    "%SCRIPT%",
    `${liveReloadScript}<script type="module" src="/${appManifest.file}"></script>`
  );

  res.send(html);
});

app.use(express.static("dist"));

// Наблюдаем за изменениями в dist только в режиме разработки
let reloadTimeout: NodeJS.Timeout | null = null;
const debounceReload = () => {
  if (!isDevelopment) return;

  if (reloadTimeout) {
    clearTimeout(reloadTimeout);
  }
  reloadTimeout = setTimeout(() => {
    console.log("Changes detected, notifying clients...");
    notifyClients();
    reloadTimeout = null;
  }, 100);
};

// Отправляем сигнал перезагрузки при изменениях только в режиме разработки
if (isDevelopment) {
  process.on("SIGUSR2", () => {
    console.log("Nodemon restart detected");
    debounceReload();
  });
}

server.listen(port, () => {
  console.log(
    `Server running at http://localhost:${port} in ${
      isDevelopment ? "development" : "production"
    } mode`
  );
});
