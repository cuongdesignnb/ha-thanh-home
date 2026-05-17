import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const envPath = path.join(root, ".env.docker");
const examplePath = path.join(root, ".env.docker.example");
const sourcePath = fs.existsSync(envPath) ? envPath : examplePath;

if (!fs.existsSync(sourcePath)) {
  console.error("Missing .env.docker and .env.docker.example. Cannot check Docker ports.");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(sourcePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key, rest.join("=").replace(/^"|"$/g, "")];
    }),
);

const ports = [
  ["WEB_PORT", env.WEB_PORT || "31873"],
  ["ADMIN_PORT", env.ADMIN_PORT || "31874"],
  ["API_PORT", env.API_PORT || "31875"],
  ["MYSQL_HOST_PORT", env.MYSQL_HOST_PORT || "31906"],
];

function canBind(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(Number(port), host);
  });
}

function usedByOwnContainer(port) {
  try {
    const output = execFileSync("docker", ["ps", "--format", "{{.Names}}|{{.Ports}}"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split(/\r?\n/)
      .filter(Boolean)
      .some((line) => {
        const [name, ports] = line.split("|");
        return name?.startsWith("hathanh-") && ports?.includes(`:${port}->`);
      });
  } catch {
    return false;
  }
}

const conflicts = [];

for (const [name, port] of ports) {
  const host = name === "MYSQL_HOST_PORT" ? "127.0.0.1" : "0.0.0.0";
  const open = await canBind(port, host);
  if (!open && !usedByOwnContainer(port)) {
    conflicts.push({ name, port });
  }
}

if (conflicts.length > 0) {
  console.error("Docker port check failed. Change these variables in .env.docker:");
  for (const conflict of conflicts) {
    console.error(`- ${conflict.name}=${conflict.port} is already in use`);
  }
  process.exit(1);
}

console.log(`Docker port check passed using ${path.basename(sourcePath)}:`);
for (const [name, port] of ports) {
  console.log(`- ${name}=${port}`);
}
