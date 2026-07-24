# scripts

此目录存放本地开发与工程辅助脚本。

- `dev-all.ts`：检查前后端端口，并同时启动 Vite 与 Express 开发服务。
- `sync-gallery.ts`：扫描画廊源目录，生成 WebP 缩略图、展示图和类型安全的图片清单。

画廊默认读取 `E:\桌面\pic`，可通过环境变量临时覆盖：

```powershell
$env:GALLERY_SOURCE_DIR = "D:\其他图片目录"
npm run gallery:sync
```
