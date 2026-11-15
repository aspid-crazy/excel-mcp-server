# Excel Workbooks MCP

Lets the chat agent work with Excel workbooks (.xlsx) without Excel installed: read and
write cells and ranges, formulas, tables, charts, pivot tables, formatting, CSV import
and export.

The extension registers [excel-mcp-server](https://github.com/haris-musa/excel-mcp-server)
(our fork: <https://github.com/aspid-crazy/excel-mcp-server>) with the editor. The server
is packaged inside the extension: Python is not needed.

## Access

The agent may open workbooks only inside the workspace folders and the folders listed in
**`kvantExcelMcp.allowedDirectories`**. Without an open folder and without that setting
the server is not offered. **`kvantExcelMcp.readOnly`** leaves only the reading tools.

The server appears in **MCP: List Servers** as **Excel**.

## Build

`node build.mjs` on the target OS (needs `uv`), then
`npx @vscode/vsce package --target win32-x64` (or `linux-x64`).
