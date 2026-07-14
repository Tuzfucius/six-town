# components

页面组件目录。

- `LandingView.tsx`：六镇毛玻璃卡片选择和都市圈总览入口。
- `MetroOverviewView.tsx`：展示四市、六镇产业节点、节点信息和底图切换。
- `TownView.tsx`：小镇产业详情、企业与图谱内容页。
- `TownMapView.tsx`：MapLibre 地图视图、底图切换与企业光柱侧栏。
- `TownBackground.tsx`：按小镇类型切换的动态背景。

组件展示的业务内容应来自 `src/data/towns.ts`，不要在组件内新增无法复用的企业或点位数据。
