# Thermophysical-Property-Calls

基于 **CoolProp 统一 API** 的物性查询 Web 应用，严格遵循 **coolpropapi.jingyanrong.com** 规范：`API_所有类别调用规则.md`、`EXTERNAL_API_CALL_GUIDE.md`（五大工质分类、请求/响应格式）。

**本应用不包含后端**，所有物性计算请求发往统一 API：

- **生产**：`https://coolpropapi.jingyanrong.com`
- **本地**：`http://localhost:8000`（需自行运行或使用已部署服务）

API 文档：`/docs`（Swagger）、`/redoc`。

## 技术栈

- **前端**：Vite + React 18 + TailwindCSS
- **后端**：无（调用外部 CoolProp API）

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173 。默认请求生产 API；若使用本地 API，在项目根目录创建 `.env`：

```env
VITE_API_URL=http://localhost:8000
```

## 生产构建

```bash
npm run build
```

静态产物在 `dist/`。默认使用 `https://coolpropapi.jingyanrong.com`；覆盖 API 地址：

```bash
VITE_API_URL=https://coolpropapi.jingyanrong.com npm run build
```

## 部署

- 阿里云 + GitHub Actions：见 **`DEPLOY.md`**
- GitHub Pages 备用：见 `.github/workflows/deploy-gh-pages.yml`（手动触发）

## 项目结构

```
├── API_所有类别调用规则.md   # API 完整规则，Cursor 中 @ 引用
├── EXTERNAL_API_CALL_GUIDE.md  # coolpropapi.jingyanrong.com 外部调用提示语
├── src/
│   ├── lib/constants.js     # 五大类选项与工质列表
│   ├── hooks/useCoolProp.js # 拼接 fluid、调用 API、归一化结果
│   ├── services/api.js      # fetchProps、fetchHumidAir、健康检查等
│   ├── components/          # 结果卡片 + 5 类表单
│   └── App.jsx              # 顶部 Tabs + 动态表单
└── DEPLOY.md
```

## 工质分类与接口对照

| 类型 | 计算接口 | 请求要点 |
|------|----------|----------|
| 1 纯流体 | POST /api/props | `fluid`=名称，2 个输入，无 composition |
| 2 不可压缩纯流体 | POST /api/props | `fluid`=INCOMP::名称 |
| 3 不可压缩溶液 | POST /api/props | `fluid`=INCOMP::名称，**composition 必填** 0–1 |
| 4 可压缩混合物 | POST /api/props | `fluid`=HEOS::A[x1]&B[x2]，仅 (P,T)/(P,Q)/(T,Q) |
| 5 湿空气 | POST /api/humid-air/props | 3 组 input_key/value + 1 个 output_key |

详见 `API_所有类别调用规则.md`、`EXTERNAL_API_CALL_GUIDE.md`；与 CoolProp 官网对照见 `docs/COOLPROP_OFFICIAL_ALIGNMENT.md`（位于 API 服务端项目）。  
- 湿空气接口 404：参考 **`阿里云API部署排查流程.md`** 排查 coolprop-api 部署。  
- 怀疑本前端阿里云配置有误：参考 **`阿里云前端部署检测流程.md`** 排查 tpc.jingyanrong.com。
