# 服务层

此目录存放浏览器与本地后端之间的通信封装。`difyChat.ts` 负责调用本项目的 `/api/chat` 代理并解析 Dify 的 SSE 响应，不包含 API Key 或 Dify 服务地址。
