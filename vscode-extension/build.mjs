// Builds the server into server/ as a self-contained PyInstaller folder for the
// current platform, so the VSIX needs no Python on the user's machine.
// Run on each target OS (win32-x64 on Windows, linux-x64 on Linux), then
//   npx @vscode/vsce package --target <target>
// Python 3.13 matches the Word server build.
import { execFileSync } from 'node:child_process';
import { copyFileSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = '..';
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });
const win = process.platform === 'win32';
const venvBin = win ? join(root, '.venv', 'Scripts') : join(root, '.venv', 'bin');
const exe = name => join(venvBin, win ? `${name}.exe` : name);

run('uv', ['sync', '--python', '3.13'], { cwd: root });
run('uv', ['pip', 'install', '--python', exe('python'), 'pyinstaller']);
rmSync('server', { recursive: true, force: true });
run(exe('pyinstaller'), [
    '--noconfirm', '--onedir', '--name', 'excel-mcp',
    '--distpath', 'build/dist', '--workpath', 'build/work', '--specpath', 'build',
    '--collect-submodules', 'excel_mcp', '--collect-data', 'excel_mcp',
    '--copy-metadata', 'mcp', '--copy-metadata', 'excel-mcp-server',
    'excel_entry.py',
]);
renameSync(join('build', 'dist', 'excel-mcp'), 'server');
copyFileSync(join(root, 'LICENSE'), 'LICENSE');
