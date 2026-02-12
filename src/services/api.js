/**
 * CoolProp 统一 API 客户端
 * 规则：API_所有类别调用规则.md、EXTERNAL_API_CALL_GUIDE.md
 * 生产：https://coolpropapi.jingyanrong.com  本地：http://localhost:8000
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://coolpropapi.jingyanrong.com'

function parseDetail(detail) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0]
    return first?.msg ?? first?.message ?? JSON.stringify(detail)
  }
  return '请求错误'
}

/**
 * 流体物性 POST /api/props
 * 请求体：output_key, input1_key, input1_value, input2_key, input2_value, fluid [, composition]
 * 响应：{ result, unit, status }
 */
export async function fetchProps(payload) {
  const res = await fetch(`${API_BASE}/api/props`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(parseDetail(data.detail) || res.statusText)
  return data
}

/**
 * 湿空气物性 POST /api/humid-air/props
 * 请求体：output_key, input1_key, input1_value, input2_key, input2_value, input3_key, input3_value
 * 响应：{ result, unit, status }
 */
export async function fetchHumidAir(payload) {
  const res = await fetch(`${API_BASE}/api/humid-air/props`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(parseDetail(data.detail) || res.statusText)
  return data
}

/**
 * 健康检查 GET /
 */
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/`)
  return res.ok ? res.json() : null
}

/**
 * 介质列表 GET /api/fluids
 */
export async function fetchFluids() {
  const res = await fetch(`${API_BASE}/api/fluids`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(parseDetail(data.detail) || res.statusText)
  return data
}

/**
 * 流体物性参数列表 GET /api/properties
 */
export async function fetchProperties() {
  const res = await fetch(`${API_BASE}/api/properties`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(parseDetail(data.detail) || res.statusText)
  return data
}

/**
 * 湿空气参数列表 GET /api/humid-air/properties
 */
export async function fetchHumidAirProperties() {
  const res = await fetch(`${API_BASE}/api/humid-air/properties`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(parseDetail(data.detail) || res.statusText)
  return data
}
