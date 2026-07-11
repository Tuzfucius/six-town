# components

页面组件目录。

- `LandingView.tsx`：六镇总览和导航入口。
- `TownView.tsx`：小镇产业详情、企业与图谱内容页。
- `TownMapView.tsx`：MapLibre 地图视图与空间标记侧栏。
- `TownBackground.tsx`：按小镇类型切换的动态背景。

组件展示的业务内容应来自 `src/data/towns.ts`，不要在组件内新增无法复用的企业或点位数据。
