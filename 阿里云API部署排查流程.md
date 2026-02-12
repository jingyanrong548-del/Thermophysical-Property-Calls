# 阿里云 API 部署排查流程（coolpropapi.jingyanrong.com 404）

当湿空气接口 `POST /api/humid-air/props` 返回 **404 Not Found** 时，按以下顺序排查。

---

## 一、区分部署对象

| 项目 | 域名 | 说明 |
|------|------|------|
| **前端** Thermophysical-Property-Calls | tpc.jingyanrong.com | 静态页面，已部署正常 |
| **API** coolprop-api | coolpropapi.jingyanrong.com | 返回 404 的是**此处** |

404 来自 **coolpropapi.jingyanrong.com**，需排查 **coolprop-api 的阿里云部署**，而非前端。

---

## 二、排查步骤

### 步骤 1：确认 API 根路径是否可达

在终端执行：

```bash
curl -s https://coolpropapi.jingyanrong.com/
```

**预期**：返回 JSON，如 `{"message":"...", "status":"running"}` 或类似。

- 若**无响应 / 超时**：域名未解析、服务器未启动或防火墙拦截。
- 若**有响应**：进入步骤 2。

---

### 步骤 2：确认流体物性接口是否正常

```bash
curl -s -X POST https://coolpropapi.jingyanrong.com/api/props \
  -H "Content-Type: application/json" \
  -d '{"output_key":"H","input1_key":"P","input1_value":1000000,"input2_key":"Q","input2_value":0,"fluid":"Water"}'
```

**预期**：返回 `{"result":..., "unit":"J/kg", "status":"success"}`。

- 若**200 有 result**：说明 `/api/props` 正常，问题集中在湿空气路由。
- 若**404**：说明整个 API 或路由前缀可能不对，检查 Nginx/反向代理配置。

---

### 步骤 3：直接请求湿空气接口

```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST https://coolpropapi.jingyanrong.com/api/humid-air/props \
  -H "Content-Type: application/json" \
  -d '{"output_key":"W","input1_key":"T","input1_value":298.15,"input2_key":"P","input2_value":101325,"input3_key":"R","input3_value":0.5}'
```

**预期**：200 + JSON 含 `result`；若 404 则说明该路由未实现或未暴露。

---

### 步骤 4：检查 coolprop-api 项目是否实现湿空气路由

在 **coolprop-api 本地库** 中：

1. 搜索路由定义，如：`humid-air`、`/api/humid-air`、`humidair`。
2. 确认是否有类似：
   - FastAPI: `@app.post("/api/humid-air/props")`
   - Flask: `@app.route("/api/humid-air/props", methods=["POST"])`
   - Express: `router.post("/api/humid-air/props", ...)`

若**无此路由**：需要在 coolprop-api 中实现，参考 `cursor-prompt-coolprop-api.md` 提示语 4。

---

### 步骤 5：检查 Nginx / 反向代理（若 coolprop-api 在阿里云）

登录阿里云服务器，查看 Nginx 配置中 `coolpropapi.jingyanrong.com` 的 `location`：

```bash
# 查找站点配置
grep -r "coolpropapi" /etc/nginx/
# 或
grep -r "coolpropapi" /www/server/panel/vhost/nginx/
```

确认是否有：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;  # 或你的 API 端口
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

- 若只有 `location /api/props` 而**没有** `/api/humid-air`，或 `proxy_pass` 未覆盖该路径，可能返回 404。
- 建议使用 `location /api/` 统一转发到后端，让应用层处理 `/api/humid-air/props`。

---

### 步骤 6：检查 API 进程是否包含湿空气模块

若 coolprop-api 用 Docker 或 systemd 运行：

```bash
# 查看运行中的 API 容器/进程
docker ps | grep coolprop
# 或
ps aux | grep python
ps aux | grep uvicorn
```

确认部署的镜像/代码是否为**最新版本**，且包含湿空气相关代码（若之前未实现，需先实现再重新部署）。

---

### 步骤 7：本地验证 API（排除阿里云网络问题）

在本地运行 coolprop-api：

```bash
cd /path/to/coolprop-api
# 按项目启动方式，例如：
# uvicorn main:app --reload --port 8000
```

然后本地测试：

```bash
curl -X POST http://localhost:8000/api/humid-air/props \
  -H "Content-Type: application/json" \
  -d '{"output_key":"W","input1_key":"T","input1_value":298.15,"input2_key":"P","input2_value":101325,"input3_key":"R","input3_value":0.5}'
```

- 若**本地 200**、线上 404：多半是阿里云部署的代码或路由未更新。
- 若**本地也 404**：coolprop-api 尚未实现湿空气接口，需按 `cursor-prompt-coolprop-api.md` 提示语 4 添加。

---

## 三、快速诊断命令汇总

复制到终端一次执行：

```bash
echo "=== 1. 根路径 ==="
curl -s -o /dev/null -w "%{http_code}" https://coolpropapi.jingyanrong.com/
echo ""

echo "=== 2. 流体 /api/props ==="
curl -s -o /dev/null -w "%{http_code}" -X POST https://coolpropapi.jingyanrong.com/api/props \
  -H "Content-Type: application/json" \
  -d '{"output_key":"H","input1_key":"P","input1_value":1000000,"input2_key":"Q","input2_value":0,"fluid":"Water"}'
echo ""

echo "=== 3. 湿空气 /api/humid-air/props ==="
curl -s -o /dev/null -w "%{http_code}" -X POST https://coolpropapi.jingyanrong.com/api/humid-air/props \
  -H "Content-Type: application/json" \
  -d '{"output_key":"W","input1_key":"T","input1_value":298.15,"input2_key":"P","input2_value":101325,"input3_key":"R","input3_value":0.5}'
echo ""
```

**解读**：

- 1 和 2 为 200、3 为 404 → 湿空气路由未实现或未正确暴露。
- 1 或 2 为 404 → 整个 API 或 Nginx 配置有问题。
- 全部超时 → 域名、服务器或网络不通。

---

## 四、结论对照

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 根路径 200，/api/props 200，/api/humid-air 404 | 湿空气路由未实现或未部署 | 在 coolprop-api 中实现接口并重新部署 |
| /api/props 也 404 | Nginx 只转发了部分路径，或 API 未正确运行 | 检查 Nginx `location /api/` 与 API 进程 |
| 全部超时 | 域名、防火墙或服务未启动 | 检查 DNS、安全组、进程状态 |
| 本地 200、线上 404 | 线上代码/配置未更新 | 重新部署 coolprop-api 到阿里云 |
