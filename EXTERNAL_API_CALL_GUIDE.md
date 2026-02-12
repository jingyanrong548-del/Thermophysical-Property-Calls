# CoolProp API 外部调用提示语

> 将以下内容复制给其他 App（或 Cursor/LLM），即可按规则调用本 API。  
> 完整规则见：[API_所有类别调用规则.md](./API_所有类别调用规则.md)  
> **来源**：coolpropapi.jingyanrong.com 最新规范

---

## 一、基础信息

- **API 根地址（生产）**：`https://coolpropapi.jingyanrong.com`
- **API 根地址（本地）**：`http://localhost:8000`
- **文档**：`{BASE}/docs`（Swagger）、`{BASE}/redoc`
- **请求**：`Content-Type: application/json`，UTF-8
- **认证**：无；支持 CORS
- **成功**：HTTP 200，响应体 `{ "result": number, "unit": string, "status": "success" }`
- **错误**：HTTP 400/500/503，响应体 `{ "detail": "错误描述" }`

---

## 二、接口一览

| 用途           | 方法 | 路径                         |
|----------------|------|------------------------------|
| 健康检查       | GET  | `/`                          |
| 流体物性计算   | POST | `/api/props`                 |
| 湿空气物性计算 | POST | `/api/humid-air/props`       |
| 流体物性参数列表 | GET  | `/api/properties`            |
| 湿空气参数列表 | GET  | `/api/humid-air/properties`  |
| 介质列表       | GET  | `/api/fluids`                |
| 单介质限制     | GET  | `/api/fluids/{fluid_name}/limits` |
| 全部介质限制   | GET  | `/api/fluids/limits`         |
| 介质详情列表   | GET  | `/fluids/list`               |

---

## 三、流体物性（POST /api/props）

**请求体（JSON）**：

- `output_key`（必填）：待求物性，如 `H`(焓)、`D`(密度)、`T`(温度)、`S`(熵)、`C`(比热)、`VISC`(粘度)、`L`(热导率) 等。
- `input1_key`、`input1_value`、`input2_key`、`input2_value`（必填）：两个已知状态参数。
- `fluid`（必填）：工质名称，格式见下表。
- `composition`（可选）：**仅不可压缩溶液**使用，0–1 之间。

**fluid 与介质类型**：

| 类型             | fluid 格式              | composition   | 示例 fluid                |
|------------------|--------------------------|---------------|---------------------------|
| 纯流体           | 直接名称                 | 不传          | `Water`、`R134a`、`Air`   |
| 不可压缩纯流体   | `INCOMP::` + 名称        | 不传          | `INCOMP::Water`、`INCOMP::DowQ` |
| 不可压缩溶液     | `INCOMP::` + 溶液名      | **必传** 0–1  | `INCOMP::LiBr`、`INCOMP::MEG`（乙二醇水溶液为 MEG） |
| 可压缩混合流体   | `HEOS::A[x1]&B[x2]&...`  | 不传          | `HEOS::R32[0.5]&R125[0.5]`（摩尔分数） |

**单位**：压力 Pa，温度 K，干度 Q 为 0–1。K = °C + 273.15，1 bar = 1e5 Pa。

**示例请求**：

```json
POST {BASE}/api/props

纯流体（水饱和液体焓）：
{ "output_key": "H", "input1_key": "P", "input1_value": 1000000, "input2_key": "Q", "input2_value": 0, "fluid": "Water" }

纯流体（P-T 求密度）：
{ "output_key": "D", "input1_key": "P", "input1_value": 500000, "input2_key": "T", "input2_value": 300, "fluid": "R134a" }

不可压缩溶液（必须带 composition）：
{ "output_key": "H", "input1_key": "T", "input1_value": 300, "input2_key": "P", "input2_value": 101325, "fluid": "INCOMP::LiBr", "composition": 0.5 }

可压缩混合流体（仅支持 (P,T)、(P,Q)、(T,Q)）：
{ "output_key": "D", "input1_key": "P", "input1_value": 500000, "input2_key": "T", "input2_value": 300, "fluid": "HEOS::R32[0.5]&R125[0.5]" }
```

**介质列表来源**：先调 `GET {BASE}/api/fluids`，响应中含 `pure_fluids`、`incompressible_fluids`、`incompressible_solutions`，供拼写 `fluid` 使用。

---

## 四、湿空气物性（POST /api/humid-air/props）

湿空气需 **3 个** 状态变量确定状态，再求 1 个输出。无 `fluid` 字段。

**请求体（JSON）**：

- `output_key`（必填）：待求物性，如 `H`、`W`(含湿量)、`D`(露点)、`R`(相对湿度)、`B`(湿球) 等。
- `input1_key`、`input1_value`、`input2_key`、`input2_value`、`input3_key`、`input3_value`（必填）：三个已知状态参数。

**常用参数代码**：T(干球温度 K)、P(压力 Pa)、R(相对湿度 0–1)、W(含湿量 kg水/kg干空气)、D(露点 K)、B(湿球 K)、H(焓 J/kg)。更多见 `GET {BASE}/api/humid-air/properties`。

**示例请求**：

```json
POST {BASE}/api/humid-air/props

25°C、101325 Pa、50% 相对湿度 → 焓 H：
{ "output_key": "H", "input1_key": "T", "input1_value": 298.15, "input2_key": "P", "input2_value": 101325, "input3_key": "R", "input3_value": 0.5 }

同上条件 → 含湿量 W：
{ "output_key": "W", "input1_key": "T", "input1_value": 298.15, "input2_key": "P", "input2_value": 101325, "input3_key": "R", "input3_value": 0.5 }

同上条件 → 露点 D：
{ "output_key": "D", "input1_key": "T", "input1_value": 298.15, "input2_key": "P", "input2_value": 101325, "input3_key": "R", "input3_value": 0.5 }
```

---

## 五、错误与状态码

- **200**：成功，取 `response.result`、`response.unit`。
- **400**：参数错误（工质不存在、参数组合无效、溶液缺 composition 或超范围等），详见 `response.detail`。
- **500**：服务端/计算错误。
- **503**：仅湿空气接口，表示湿空气模块不可用。

---

## 六、调用约定（给集成方）

1. 所有 POST 请求体为 JSON，URL 为 `{BASE}` + 上表路径，无需在路径后加查询参数传物性。
2. 介质名必须与 `GET /api/fluids` 返回一致；不可压缩溶液名在 `incompressible_solutions` 中（如 MEG 而非 EG）。
3. 不可压缩溶液调用 `/api/props` 时必须带 `composition`（0–1），否则会 400。
4. 湿空气只用 `/api/humid-air/props`，不要用 `/api/props`。
5. 混合流体浓度为摩尔分数，且仅支持 (P,T)、(P,Q)、(T,Q) 组合。

---

## 七、快速代码片段

**JavaScript/TypeScript（流体）**：

```javascript
const BASE = "https://coolpropapi.jingyanrong.com";
const res = await fetch(`${BASE}/api/props`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    output_key: "H", input1_key: "P", input1_value: 1000000,
    input2_key: "Q", input2_value: 0, fluid: "Water"
  })
});
const data = await res.json();
if (res.ok) console.log(data.result, data.unit); else console.error(data.detail);
```

**JavaScript/TypeScript（湿空气）**：

```javascript
const res = await fetch(`${BASE}/api/humid-air/props`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    output_key: "H",
    input1_key: "T", input1_value: 298.15,
    input2_key: "P", input2_value: 101325,
    input3_key: "R", input3_value: 0.5
  })
});
const data = await res.json();
if (res.ok) console.log(data.result, data.unit); else console.error(data.detail);
```

**Python**：

```python
import requests
BASE = "https://coolpropapi.jingyanrong.com"
r = requests.post(f"{BASE}/api/props", json={
    "output_key": "H", "input1_key": "P", "input1_value": 1000000,
    "input2_key": "Q", "input2_value": 0, "fluid": "Water"
})
print(r.json()["result"], r.json().get("unit")) if r.ok else print(r.json().get("detail"))
```

---

*与 [API_所有类别调用规则.md](./API_所有类别调用规则.md) 及 [docs/COOLPROP_OFFICIAL_ALIGNMENT.md](docs/COOLPROP_OFFICIAL_ALIGNMENT.md) 保持一致。*
