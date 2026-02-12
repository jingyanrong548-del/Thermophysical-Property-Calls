# CoolProp API 修改提示语（用于 coolprop-api 本地库）

将以下提示语复制到 Cursor，在 **coolprop-api** 项目目录中运行，用于修复不可压缩溶液调用、湿空气 404 等问题。

> 与 [API_所有类别调用规则.md](./API_所有类别调用规则.md) 及 [docs/COOLPROP_OFFICIAL_ALIGNMENT.md](docs/COOLPROP_OFFICIAL_ALIGNMENT.md) 保持一致。

---

## 提示语 1：修复不可压缩溶液 composition 拼接

```
本 API 的 POST /api/props 在处理「不可压缩溶液」（fluid 以 INCOMP:: 开头且请求体包含 composition 时）时，需要将 composition 拼接到 fluid 字符串后再调用 CoolProp PropsSI。

CoolProp 不可压缩溶液的正确格式为：INCOMP::流体名[浓度]，例如：
- INCOMP::LiBr[0.23]
- INCOMP::MEG[0.5]  （乙二醇水溶液，质量分数 0.5）

请检查并修改调用 CoolProp 的代码逻辑：
1. 当请求包含 composition 且 fluid 以 INCOMP:: 开头时
2. 若 fluid 尚未包含 [...] 浓度后缀
3. 则将 fluid 拼接为 INCOMP::名称[composition]，再传给 PropsSI

例如：fluid="INCOMP::MEG", composition=0.5 → 实际调用时 fluid 应为 "INCOMP::MEG[0.5]"
```

---

## 提示语 2：确保 GET /api/fluids 返回正确的 incompressible 列表

```
请确保 GET /api/fluids 接口正确区分并返回：

1. incompressible_fluids：不可压缩纯流体列表（来自 CoolProp get_global_param_string("incompressible_list_pure")）
   - 示例：DowJ, DowQ, Water, NBS, HC20, HC30, HC40, T66, TVP1, PCL...

2. incompressible_solutions：不可压缩溶液列表（来自 CoolProp get_global_param_string("incompressible_list_solution")）
   - 示例：LiBr, MEG, MPG, MEG2, MPG2, IcePG, IceEA...
   - 注意：乙二醇水溶液在 CoolProp 中为 MEG，不是 EG

这样前端可以动态拉取正确的流体列表，避免硬编码错误名称（如 EG 在 CoolProp 中不存在）。
```

---

## 提示语 3：添加流体名别名映射（可选）

```
如需兼容前端或用户习惯使用的别名，可在 API 中对不可压缩溶液添加别名映射：

EG -> MEG  （乙二醇水溶液，CoolProp 中正确名为 MEG）
Water -> 不映射到溶液（纯水用 INCOMP::Water 或 NBS）

在解析 fluid 时，若 fluid 为 INCOMP::EG 且为溶液请求（有 composition），则内部转换为 INCOMP::MEG 后再调用 CoolProp。仅作可选增强。
```

---

## 提示语 4：实现湿空气物性接口（返回 404 时使用）

```
本 API 需要实现湿空气物性计算接口，当前调用 POST /api/humid-air/props 返回 404 Not Found。

请按 API_所有类别调用规则.md 第三节实现：

1. POST /api/humid-air/props
   - 请求体：output_key, input1_key, input1_value, input2_key, input2_value, input3_key, input3_value
   - 调用 CoolProp.HumidAir.HAPropsSI(output_key, input1_key, input1_value, input2_key, input2_value, input3_key, input3_value)
   - 响应：{ result: number, unit: string, status: "success" }

2. GET /api/humid-air/properties（可选）
   - 返回湿空气可用输入/输出参数代码与单位

CoolProp 湿空气需 3 个状态变量确定状态。常用组合：(T,P,R)、(T,P,W)、(T,P,D) 等。
Python 示例：CoolProp.CoolProp.HAPropsSI("W","T",298.15,"P",101325,"R",0.5)  # 含湿量
```

---

## 技术要点

| 类型 | fluid 格式 | composition | CoolProp 实际调用示例 |
|------|------------|-------------|------------------------|
| 不可压缩纯流体 | INCOMP::DowJ | 不传 | PropsSI(..., "INCOMP::DowJ") |
| 不可压缩溶液 | INCOMP::MEG | 必传 0~1 | PropsSI(..., "INCOMP::MEG[0.5]") |
| 湿空气 | 无 | 无 | HAPropsSI(output, k1, v1, k2, v2, k3, v3) |

CoolProp 官方溶液列表参考：https://github.com/CoolProp/CoolProp/discussions/2253

---

## 已实现说明（回归检查用）

上述四条提示语在当前 coolprop-api 代码中均已实现，与 API_所有类别调用规则.md 及 docs/COOLPROP_OFFICIAL_ALIGNMENT.md 一致。

- **提示语 1**：不可压缩溶液在有 composition 且 fluid 为 INCOMP:: 且无 [...] 时，已拼接为 INCOMP::名称[composition] 再调用 PropsSI。
- **提示语 2**：GET /api/fluids 已分别用 incompressible_list_pure、incompressible_list_solution 返回 incompressible_fluids 与 incompressible_solutions。
- **提示语 3**：INCOMP::EG 且带 composition 时已内部映射为 INCOMP::MEG。
- **提示语 4**：POST /api/humid-air/props 与 GET /api/humid-air/properties 已实现，使用 HAPropsSI（含备用导入）。

若线上仍出现湿空气 404，请用当前代码重新部署并检查网关/反向代理路径。

*仅作回归检查用；无需再次按提示语修改逻辑。*
