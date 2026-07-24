# 杭湖嘉绍六镇数字图谱

面向杭湖嘉绍都市圈特色小镇调研成果的沉浸式数字图谱。项目从空间区域和产业主题两条路径组织六镇、代表企业与园区点位，提供都市圈总览、企业目录、产业链视图和园区地图。

## 主要功能

- 首页提供“空间导览”“浏览六镇”和“影像画廊”三个入口。
- 实践影像画廊支持书册层叠、速度连续形变、平铺聚焦和全屏查看。
- 都市圈地图展示六镇空间分布、主题路线和自动导览。
- 企业目录支持产业筛选、类型筛选、产业链位置筛选与企业比较。
- 产业链视图按上游基础设施、中游技术与产品、下游应用组织企业。
- 园区地图支持企业点位联动、产业筛选、图例和视野适配。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 应用框架 | React 19、TypeScript |
| 构建工具 | Vite 6 |
| 路由 | React Router 7 |
| 地图 | MapLibre GL JS、react-map-gl |
| 动效 | Motion |
| 样式与图标 | Tailwind CSS 4、Lucide React |

项目不依赖 Vue、CesiumJS 或 Three.js。空间导览与园区地图均基于 MapLibre 实现。

## 页面路由

```text
/                    首页与六镇探索入口
/metro               都市圈空间总览
/industry-chain      产业链视图
/gallery             实践影像画廊
/:townId/info        小镇企业目录
/:townId/map         园区地图
```

## 本地开发

```powershell
npm install
npm run dev:all
```

一键启动会同时运行 Vite 前端（`http://localhost:3000`）和 Express 后端（`http://localhost:3001`）。前端的 `/api` 请求依赖后端服务；如果只运行 `npm run dev`，聊天请求会因后端未监听而出现 `ECONNREFUSED`。

如需分别启动服务，可在两个终端中运行：

```powershell
npm run server
npm run dev
```

启动脚本不会自动终止占用 `3000` 或 `3001` 端口的其他进程，也不会自动切换端口。后端端口可通过 `PORT` 设置；设置后，一键启动会同步更新 Vite 的本地代理目标。

提交前执行：

```powershell
npm run lint
npm run build
```

## 画廊素材

画廊默认从 `E:\桌面\pic` 扫描 JPG、JPEG 和 PNG 图片，生成部署所需的 WebP 缩略图、展示图及图片清单：

```powershell
npm run gallery:sync
```

如需使用其他源目录：

```powershell
$env:GALLERY_SOURCE_DIR = "D:\其他图片目录"
npm run gallery:sync
```

处理后的素材位于 `public/gallery/`，构建和部署不再依赖源图片目录。

## Dify 智能问答

聊天功能通过本项目的 Express 代理调用 Dify Chatflow。点击聊天窗口标题栏的齿轮按钮可在本机配置 Dify 基础 URL 和 API Key；密钥只会发送给本机 Express 服务，并保存到 Git 忽略的 `.dify.local.json`，不会回显、写入浏览器存储或进入构建产物、Git 仓库。

配置接口仅允许 `localhost` 访问。面向公网部署时，请使用环境变量配置 Dify 服务，不要开放本地配置入口给外部用户。

```powershell
Copy-Item .env.example .env
# 可选：在 .env 中预设 DIFY_API_BASE_URL 与 DIFY_API_KEY；不要将 .env 提交到 Git。
npm run server
npm run dev
```

启动后访问聊天窗口中的“Dify 配置”按钮填写服务地址和 API Key。开发环境中，Vite 的 `/api` 请求会代理到 `http://localhost:3001`。生产环境先构建，再通过下列方式由 Express 托管静态文件和 API：

```powershell
npm run build
$env:PORT=3000
npm start
```

## 目录结构

```text
src/
  components/        页面与交互组件
  data/              小镇、企业和主题路线数据
  App.tsx             路由入口
  main.tsx            React 应用入口
```

当前数据由前端静态资料驱动，不包含后端服务。企业、位置、统计和来源信息上线前应完成核验；缺少可靠资料时不展示推测性内容。
