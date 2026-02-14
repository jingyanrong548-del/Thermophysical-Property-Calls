import { useState, useCallback } from 'react'
import { fetchProps, fetchHumidAir } from '../services/api'
import { FLUID_TYPES } from '../lib/constants'

/**
 * 根据工质类型与选择，拼接 API 要求的 fluid 字符串（见 API_所有类别调用规则.md）
 */
export function buildFluidString(fluidType, fluidOption, fraction, mixtureParts) {
  if (fluidType === 5) return null
  const typeInfo = FLUID_TYPES.find((t) => t.id === fluidType)
  if (!typeInfo) return ''

  if (fluidType === 4) {
    if (!Array.isArray(mixtureParts) || mixtureParts.length < 2) return ''
    const sum = mixtureParts.reduce((s, p) => s + (p.fraction || 0), 0)
    if (Math.abs(sum - 1) > 0.001) return ''
    return 'HEOS::' + mixtureParts.map((p) => `${p.name}[${p.fraction}]`).join('&')
  }
  if (!fluidOption) return ''
  if (fluidType === 1) return fluidOption.trim()
  if (fluidType === 2) return `INCOMP::${fluidOption.trim()}`
  if (fluidType === 3) return `INCOMP::${fluidOption.replace(/\s*\([^)]*\)\s*/, '').trim()}`
  return ''
}

export function getIncompSolutionName(option) {
  const m = option?.match(/^([A-Za-z0-9-]+)/)
  return m ? m[1] : (option || '').replace(/\s*\([^)]*\)\s*/, '').trim()
}

/**
 * 将 API 响应 { result, unit, status } 规范为 UI 使用的 { value, unit, description, output_key, output_unit, isHumidAir }
 * output_unit 用于将 value 从 SI 转为用户选择单位显示
 */
function normalizeResult(data, outputKey, outputUnit = null, isHumidAir = false) {
  if (!data) return null
  return {
    value: data.result,
    unit: data.unit ?? '-',
    description: outputKey ?? data.output_key ?? 'result',
    output_key: outputKey ?? data.output_key,
    output_unit: outputUnit,
    isHumidAir,
  }
}

export function useCoolProp() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const queryProps = useCallback(async (params) => {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const {
        fluidType,
        fluid,
        composition,
        output_key,
        output_unit,
        input1_key,
        input1_value,
        input2_key,
        input2_value,
      } = params
      if (fluidType >= 1 && fluidType <= 4) {
        const body = {
          output_key,
          input1_key,
          input1_value: Number(input1_value),
          input2_key,
          input2_value: Number(input2_value),
          fluid,
        }
        if (fluidType === 3 && composition != null) body.composition = Number(composition)
        const data = await fetchProps(body)
        setResult(normalizeResult(data, output_key, output_unit, false))
        return data
      }
      throw new Error('请使用湿空气接口')
    } catch (e) {
      const msg = e.message || '请求失败'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const queryHumidAir = useCallback(async (params) => {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      // 密度：API 无直接 key，请求比容 V 后在前端用 ρ = 1/V 计算
      const outputKey = params.output_key === 'Density' ? 'V' : params.output_key
      const body = {
        output_key: outputKey,
        input1_key: params.input1_key,
        input1_value: Number(params.input1_value),
        input2_key: params.input2_key,
        input2_value: Number(params.input2_value),
        input3_key: params.input3_key,
        input3_value: Number(params.input3_value),
      }
      const data = await fetchHumidAir(body)
      const displayData = params.output_key === 'Density' && data?.result != null
        ? { ...data, result: 1 / data.result, unit: 'kg/m³' }
        : data
      setResult(normalizeResult(displayData, params.output_key, params.output_unit, true))
      return displayData
    } catch (e) {
      const msg = e.message || '请求失败'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, error, loading, queryProps, queryHumidAir }
}
