// Kvant wrapper: registers the Excel MCP server with the editor.
//
// The server ships inside the VSIX as a PyInstaller folder (server/), built per
// platform, so the user needs no Python. Access is limited with --allow-dir to
// the workspace folders plus kvantExcelMcp.allowedDirectories; with none of
// them the server is not offered, since an unrestricted one could open any
// workbook on the machine.
'use strict';

const vscode = require('vscode');
const path = require('path');

const PROVIDER_ID = 'kvant.excel-mcp';
const CONFIG = 'kvantExcelMcp';

function allowedDirectories() {
    const folders = (vscode.workspace.workspaceFolders ?? [])
        .filter(f => f.uri.scheme === 'file')
        .map(f => f.uri.fsPath);
    const extra = vscode.workspace.getConfiguration(CONFIG).get('allowedDirectories', [])
        .filter(p => typeof p === 'string' && path.isAbsolute(p));
    return [...new Set([...folders, ...extra])];
}

function activate(context) {
    const changed = new vscode.EventEmitter();
    const version = context.extension.packageJSON.version;
    const exe = path.join(context.extensionPath, 'server', process.platform === 'win32' ? 'excel-mcp.exe' : 'excel-mcp');

    context.subscriptions.push(
        changed,
        vscode.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, {
            onDidChangeMcpServerDefinitions: changed.event,
            provideMcpServerDefinitions() {
                const dirs = allowedDirectories();
                if (dirs.length === 0) {
                    return [];
                }
                const args = ['stdio'];
                for (const dir of dirs) {
                    args.push('--allow-dir', dir);
                }
                if (vscode.workspace.getConfiguration(CONFIG).get('readOnly', false)) {
                    args.push('--read-only');
                }
                return [new vscode.McpStdioServerDefinition('Excel', exe, args, {}, version)];
            },
        }),
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(CONFIG)) {
                changed.fire();
            }
        }),
        vscode.workspace.onDidChangeWorkspaceFolders(() => changed.fire()),
    );
}

module.exports = { activate };
