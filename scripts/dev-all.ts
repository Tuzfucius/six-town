import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const frontendPort = 3000;
const backendPort = Number(process.env.PORT ?? 3001);
const tsxCli = fileURLToPath(new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url));
const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const children = new Map<string, ChildProcess>();
let shuttingDown = false;

function isValidPort(port: number) {
  return Number.isInteger(port) && port > 0 && port < 65_536;
}

function isPortOccupied(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = (occupied: boolean) => {
      socket.destroy();
      resolve(occupied);
    };

    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

function terminateChild(child: ChildProcess) {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    return;
  }
  child.kill('SIGTERM');
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children.values()) terminateChild(child);
  process.exitCode = exitCode;
}

function startService(name: string, executable: string, args: string[], env?: NodeJS.ProcessEnv) {
  const child = spawn(executable, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: 'inherit',
    windowsHide: true,
  });
  children.set(name, child);
  child.once('error', (error) => {
    console.error(`[dev] ${name} 启动失败：${error.message}`);
    if (name === 'frontend') shutdown(1);
  });
  child.once('exit', (code, signal) => {
    children.delete(name);
    if (shuttingDown) return;
    if (code !== 0) {
      console.error(`[dev] ${name} 已退出，退出码：${code ?? 'unknown'}，信号：${signal ?? 'none'}`);
      if (name === 'frontend') shutdown(code ?? 1);
      else console.error('[dev] 前端仍会继续运行，但聊天接口暂不可用。');
    }
  });
}

async function main() {
  if (!isValidPort(backendPort)) {
    console.error(`[dev] PORT 无效：${process.env.PORT ?? ''}，必须是 1-65535 之间的整数。`);
    process.exitCode = 1;
    return;
  }

  const [frontendOccupied, backendOccupied] = await Promise.all([
    isPortOccupied(frontendPort),
    isPortOccupied(backendPort),
  ]);

  if (frontendOccupied) {
    console.error(`[dev] 前端端口 ${frontendPort} 已被占用，将跳过 Vite 启动。`);
  } else {
    startService('frontend', process.execPath, [viteCli, '--host', '0.0.0.0', '--port', String(frontendPort)], {
      API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? `http://localhost:${backendPort}`,
    });
  }

  if (backendOccupied) {
    console.error(`[dev] 后端端口 ${backendPort} 已被占用，将跳过 Express 启动。`);
  } else {
    startService('backend', process.execPath, [tsxCli, 'server.ts']);
  }

  if (!children.size) {
    console.error('[dev] 前端和后端均未启动，请释放端口后重试。');
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => shutdown(0));
process.once('SIGTERM', () => shutdown(0));

void main().catch((error: unknown) => {
  console.error('[dev] 启动编排失败：', error);
  shutdown(1);
});
