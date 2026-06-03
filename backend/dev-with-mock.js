import { spawn } from 'node:child_process';

const processes = [];

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  processes.push(child);

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} terminó con código ${code}`);
      shutdown(code);
    }
  });

  return child;
}

function shutdown(code = 0) {
  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

run('mock-api', 'node', ['backend/mock-api.js']);
run('vite', 'npm', ['run', 'dev']);
