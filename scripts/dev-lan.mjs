import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

const port = process.env.PORT ?? "3000";
const lanIp = Object.values(networkInterfaces())
  .flat()
  .find((i) => i && i.family === "IPv4" && !i.internal)?.address;

if (!lanIp) {
  console.error("Aucune adresse réseau local trouvée.");
  process.exit(1);
}

console.log(`\nOuvre sur le téléphone : http://${lanIp}:${port}\n`);

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  env: { ...process.env, LAN_HOST: lanIp },
});
child.on("exit", (code) => process.exit(code ?? 0));
