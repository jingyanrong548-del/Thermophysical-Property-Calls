# CoolProp API 所有类别调用规则（统一入口）

> **本文档为本 API 的唯一调用规则文档**，涵盖流体（纯/不可压缩/溶液/混合）与湿空气、所有端点与示例。  
> **Cursor 用法**：在对话中输入 `@API_所有类别调用规则.md` 即可引用全文，无需复制内容。  
> **API 根地址**：`https://coolpropapi.jingyanrong.com`（生产） / `http://localhost:8000`（本地）  
> **文档**：`/docs`（Swagger）、`/redoc`  
> **请求/响应**：`Content-Type: application/json`，UTF-8；支持 CORS。

---

## 一、接口总览

| 类别 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 健康检查 | GET | `/` | 服务状态与版本 |
| 物性计算（流体） | POST | `/api/props` | 纯流体 / 不可压缩 / 溶液 / 混合流体 |
| 物性计算（湿空气） | POST | `/api/humid-air/props` | 湿空气物性（HAPropsSI） |
| 物性参数列表 | GET | `/api/properties` | 流体物性参数代码与单位 |
| 湿空气参数列表 | GET | `/api/humid-air/properties` | 湿空气输入/输出代码与单位 |
| 介质列表 | GET | `/api/fluids` | 按类型列出所有介质名 |
| 单介质限制 | GET | `/api/fluids/{fluid_name}/limits` | 指定介质的 Tmin/Tmax/Tcrit 等 |
| 全部介质限制 | GET | `/api/fluids/limits` | 所有介质限制（耗时长） |
| 介质详情列表 | GET | `/fluids/list` | 含 CAS、化学式、别名等详情 |

---

## 二、流体物性计算（POST /api/props）

**端点**：`POST /api/props`  
**请求体**：JSON，见下表。  
**成功响应**：`200`，`{ "result": number, "unit": string, "status": "success" }`。  
**错误**：`400` 参数错误，`500` 服务器错误；正文为 `{ "detail": "错误描述" }`。

### 2.1 通用请求字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `output_key` | string | 是 | 待求物性代码（如 H, D, T） |
| `input1_key` | string | 是 | 第一个已知参数代码 |
| `input1_value` | number | 是 | 第一个已知参数数值 |
| `input2_key` | string | 是 | 第二个已知参数代码 |
| `input2_value` | number | 是 | 第二个已知参数数值 |
| `fluid` | string | 是 | 工质名称或混合串（见下分类） |
| `composition` | number | 否 | **仅不可压缩溶液**使用，浓度 0–1 |

### 2.2 流体物性参数（output_key / input_key）

**输出/输入常用代码**：

| 代码 | 名称 | 单位 |
|------|------|------|
| P | 压力 | Pa |
| T | 温度 | K |
| Q | 干度 | 0–1 无量纲 |
| H | 焓 | J/kg |
| S | 熵 | J/kg/K |
| D | 密度 | kg/m³ |
| U | 内能 | J/kg |
| V | 比容 | m³/kg |
| C | 定压比热容 | J/kg/K |
| Cv | 定容比热容 | J/kg/K |
| L | 热导率 | W/m/K |
| VISC | 动力粘度 | Pa·s |
| W | 音速 | m/s |
| Tcrit / Pcrit / M 等 | 临界/摩尔质量等 | 见 GET /api/properties |

**常用输入组合**：`(P,T)`、`(P,Q)`、`(T,Q)`、`(P,H)`、`(T,H)`。  
**单位**：压力 Pa，温度 K，干度 0–1。1 bar = 1e5 Pa，K = °C + 273.15。

### 2.3 流体类别与 fluid / composition 规则

| 类别 | fluid 格式 | composition | 常用输入组合 | 获取列表 |
|------|------------|-------------|--------------|----------|
| **纯流体** | 直接名称，无前缀 | 不传 | (P,T)、(P,Q)、(T,Q)、(P,H)、(T,H) 等 | GET /api/fluids → `pure_fluids` |
| **不可压缩纯流体** | `INCOMP::` + 名称 | 不传 | (T,P) 等 | GET /api/fluids → `incompressible_fluids` |
| **不可压缩溶液** | `INCOMP::` + 溶液名 | **必传** 0–1 | (T,P) + composition | GET /api/fluids → `incompressible_solutions` |
| **可压缩混合流体** | `HEOS::A[x1]&B[x2]&...` | 不传 | **仅** (P,T)、(P,Q)、(T,Q) | 组分为纯流体，混合对以 CoolProp 为准 |

- 混合流体：x1, x2, … 为**摩尔分数**，总和 = 1.0；质量分数需先换算为摩尔分数。  
- 溶液：若未传 `composition` 且该溶液需要，API 会返回 400 并提示浓度范围。

### 2.4 各类别调用示例

**纯流体（水，饱和液体焓）**
```json
POST /api/props
{
  "output_key": "H",
  "input1_key": "P",
  "input1_value": 1000000,
  "input2_key": "Q",
  "input2_value": 0,
  "fluid": "Water"
}
```

**纯流体（R134a，P-T 求密度）**
```json
{
  "output_key": "D",
  "input1_key": "P",
  "input1_value": 500000,
  "input2_key": "T",
  "input2_value": 300,
  "fluid": "R134a"
}
```

**不可压缩纯流体**
```json
{
  "output_key": "H",
  "input1_key": "T",
  "input1_value": 300,
  "input2_key": "P",
  "input2_value": 101325,
  "fluid": "INCOMP::Water"
}
```

**不可压缩溶液（必须 composition）**
```json
{
  "output_key": "H",
  "input1_key": "T",
  "input1_value": 300,
  "input2_key": "P",
  "input2_value": 101325,
  "fluid": "INCOMP::LiBr",
  "composition": 0.5
}
```

**可压缩混合流体（R454B 泡点，摩尔分数）**
```json
{
  "output_key": "T",
  "input1_key": "P",
  "input1_value": 101325,
  "input2_key": "Q",
  "input2_value": 0,
  "fluid": "HEOS::R32[0.8298]&R1234yf[0.1702]"
}
```

**可压缩混合流体（P-T 求密度）**
```json
{
  "output_key": "D",
  "input1_key": "P",
  "input1_value": 500000,
  "input2_key": "T",
  "input2_value": 300,
  "fluid": "HEOS::R32[0.5]&R125[0.5]"
}
```

---

## 三、湿空气物性计算（POST /api/humid-air/props）

**端点**：`POST /api/humid-air/props`  
**说明**：湿空气需 **3 个** 状态变量确定状态，再求 1 个输出物性（CoolProp HAPropsSI）。  
**成功响应**：`200`，`{ "result": number, "unit": string, "status": "success" }`。  
**错误**：`400` 参数错误，`503` 湿空气模块未加载，`500` 计算错误。

### 3.1 请求体

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `output_key` | string | 是 | 待求物性代码（如 H, W, D） |
| `input1_key` | string | 是 | 第 1 个状态变量代码 |
| `input1_value` | number | 是 | 第 1 个状态变量数值 |
| `input2_key` | string | 是 | 第 2 个状态变量代码 |
| `input2_value` | number | 是 | 第 2 个状态变量数值 |
| `input3_key` | string | 是 | 第 3 个状态变量代码 |
| `input3_value` | number | 是 | 第 3 个状态变量数值 |

### 3.2 湿空气参数代码与单位

**可作输入或输出的代码**：T, P, R, W, D, B, H, Hha, V, Vha, S, Sha, P_w  

**仅输出的代码**：C, Cha, CV, CVha, K, M, Z  

| 代码 | 名称 | 单位 |
|------|------|------|
| T | 干球温度 | K |
| P | 压力 | Pa |
| R | 相对湿度 | 0–1 |
| W | 含湿量 | kg水/kg干空气 |
| D | 露点温度 | K |
| B | 湿球温度 | K |
| H | 焓（每 kg 干空气） | J/kg |
| Hha | 焓（每 kg 湿空气） | J/kg |
| V / Vha | 比容 | m³/kg |
| S / Sha | 熵 | J/kg/K |
| C / Cha | 定压比热 | J/kg/K |
| K | 热导率 | W/m/K |
| M | 动力粘度 | Pa·s |
| Z | 压缩因子 | 无量纲 |
| P_w | 水蒸气分压 | Pa |

### 3.3 常用输入组合与示例

常用组合：`(T, P, R)`、`(T, P, W)`、`(T, P, D)`、`(P, H, R)` 等（顺序任意）。

**示例：25°C、101325 Pa、50% 相对湿度 → 焓**
```json
POST /api/humid-air/props
{
  "output_key": "H",
  "input1_key": "T",
  "input1_value": 298.15,
  "input2_key": "P",
  "input2_value": 101325,
  "input3_key": "R",
  "input3_value": 0.5
}
```

**示例：同上条件 → 含湿量 W**
```json
{
  "output_key": "W",
  "input1_key": "T",
  "input1_value": 298.15,
  "input2_key": "P",
  "input2_value": 101325,
  "input3_key": "R",
  "input3_value": 0.5
}
```

**示例：同上条件 → 露点 D**
```json
{
  "output_key": "D",
  "input1_key": "T",
  "input1_value": 298.15,
  "input2_key": "P",
  "input2_value": 101325,
  "input3_key": "R",
  "input3_value": 0.5
}
```

---

## 四、查询类接口

### 4.1 GET /

**说明**：健康检查与版本。  
**响应示例**：
```json
{
  "Hello": "CoolProp API is running! Go to /docs for usage.",
  "message": "CoolProp 物性 API 服务",
  "docs": "/docs",
  "version": "1.0.0",
  "coolprop_version": "7.2.0",
  "coolprop_status": "loaded"
}
```

### 4.2 GET /api/properties

**说明**：流体物性参数列表（用于 /api/props 的 output_key、input_key）。  
**响应**：`status`、`count`、`properties`（代码 → 名称、单位、描述）。

### 4.3 GET /api/humid-air/properties

**说明**：湿空气可用输入/输出代码及单位（用于 /api/humid-air/props）。  
**响应**：`status`、`description`、`input_output_keys`、`output_only_keys`、`units`。

### 4.4 GET /api/fluids

**说明**：所有介质名称，按类型分类。  
**响应**：`status`、`summary`（total、pure_fluids_count、incompressible_fluids_count、incompressible_solutions_count）、`pure_fluids`、`incompressible_fluids`、`incompressible_solutions`。

### 4.5 GET /api/fluids/{fluid_name}/limits

**说明**：指定介质的有效范围与临界参数。  
**路径参数**：`fluid_name` 与 /api/props 的 `fluid` 一致（纯流体如 `Water`，不可压缩如 `INCOMP::Water`、`INCOMP::LiBr`）。  
**响应**：`status`、`fluid`、`limits`（Tmin、Tmax、Tcrit、Pcrit、Ttriple、Ptriple、M 等）、`units`。

### 4.6 GET /api/fluids/limits

**说明**：所有介质的限制信息；耗时长，慎用。  
**响应**：`status`、`count`、`fluids`（每项含 fluid、Tmin、Tmax、Tcrit、Pcrit、M 等）。

### 4.7 GET /fluids/list

**说明**：介质详细列表（name、type、cas、formula、aliases、t_min、t_max、t_crit、p_crit 等）。  
**响应**：`count`、`summary`、`data`（数组）。

---

## 五、单位与错误约定

### 5.1 通用单位

- **压力**：Pa（1 bar = 1e5 Pa，1 MPa = 1e6 Pa，1 atm ≈ 101325 Pa）。  
- **温度**：K（K = °C + 273.15）。  
- **干度 Q**：0–1，无量纲。  
- **湿空气 R**：相对湿度 0–1。  
- **湿空气 W**：kg水/kg干空气。

### 5.2 错误响应

- 格式：`{ "detail": "错误描述" }`。  
- **400**：工质不存在、参数组合无效、浓度缺失或超范围等。  
- **500**：CoolProp 未加载、计算异常等。  
- **503**：湿空气模块不可用（仅湿空气接口）。

---

## 六、类别与接口对照简表

| 类别 | 计算接口 | 请求要点 | 列表/参数接口 |
|------|----------|----------|----------------|
| 纯流体 | POST /api/props | fluid=名称，无 composition，2 个输入 | GET /api/fluids（pure_fluids）, GET /api/properties |
| 不可压缩纯流体 | POST /api/props | fluid=INCOMP::名称，无 composition | GET /api/fluids（incompressible_fluids） |
| 不可压缩溶液 | POST /api/props | fluid=INCOMP::名称，**composition 必填** | GET /api/fluids（incompressible_solutions） |
| 可压缩混合流体 | POST /api/props | fluid=HEOS::A[x1]&B[x2]，仅 (P,T)/(P,Q)/(T,Q) | 组分见 pure_fluids |
| 湿空气 | POST /api/humid-air/props | 3 组输入 + 1 个输出，无 fluid | GET /api/humid-air/properties |

---

## 七、快速参考与代码模板

### 7.1 流体物性（POST /api/props）

**Python**
```python
import requests
BASE = "https://coolpropapi.jingyanrong.com"  # 或 http://localhost:8000
r = requests.post(f"{BASE}/api/props", json={
    "output_key": "H",
    "input1_key": "P",
    "input1_value": 1000000,
    "input2_key": "Q",
    "input2_value": 0,
    "fluid": "Water"
})
data = r.json()
print(data["result"], data.get("unit"))
```

**JavaScript**
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
console.log(data.result, data.unit);
```

### 7.2 湿空气物性（POST /api/humid-air/props）

**Python**
```python
r = requests.post(f"{BASE}/api/humid-air/props", json={
    "output_key": "H",
    "input1_key": "T", "input1_value": 298.15,
    "input2_key": "P", "input2_value": 101325,
    "input3_key": "R", "input3_value": 0.5
})
```

**cURL（流体）**
```bash
curl -X POST "https://coolpropapi.jingyanrong.com/api/props" \
  -H "Content-Type: application/json" \
  -d '{"output_key":"H","input1_key":"P","input1_value":1000000,"input2_key":"Q","input2_value":0,"fluid":"Water"}'
```

**cURL（湿空气）**
```bash
curl -X POST "https://coolpropapi.jingyanrong.com/api/humid-air/props" \
  -H "Content-Type: application/json" \
  -d '{"output_key":"H","input1_key":"T","input1_value":298.15,"input2_key":"P","input2_value":101325,"input3_key":"R","input3_value":0.5}'
```

### 7.3 错误处理

- 成功：`response.status_code == 200`，结果在 `result`，单位在 `unit`。  
- 错误：`response.json()["detail"]` 为错误说明；400 参数错误，500 服务器错误，503 仅湿空气模块不可用。

---

*文档与代码一致，以实际 API 行为为准。*
