/**
 * 物性常用单位及与 SI 的换算
 * API 统一使用 SI：温度 K、压力 Pa、焓 J/kg、密度 kg/m³ 等
 */

// 温度：SI = K
const tempUnits = [
  { value: 'K', label: 'K', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'C', label: '℃', toSI: (v) => Number(v) + 273.15, fromSI: (v) => v - 273.15 },
  { value: 'F', label: '°F', toSI: (v) => (Number(v) - 32) * (5 / 9) + 273.15, fromSI: (v) => (v - 273.15) * (9 / 5) + 32 },
]

// 压力：SI = Pa
const pressureUnits = [
  { value: 'Pa', label: 'Pa', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'kPa', label: 'kPa', toSI: (v) => Number(v) * 1e3, fromSI: (v) => v / 1e3 },
  { value: 'MPa', label: 'MPa', toSI: (v) => Number(v) * 1e6, fromSI: (v) => v / 1e6 },
  { value: 'bar', label: 'bar', toSI: (v) => Number(v) * 1e5, fromSI: (v) => v / 1e5 },
  { value: 'atm', label: 'atm', toSI: (v) => Number(v) * 101325, fromSI: (v) => v / 101325 },
  { value: 'psi', label: 'psi', toSI: (v) => Number(v) * 6894.76, fromSI: (v) => v / 6894.76 },
]

// 密度：SI = kg/m³
const densityUnits = [
  { value: 'kg_m3', label: 'kg/m³', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'g_cm3', label: 'g/cm³', toSI: (v) => Number(v) * 1000, fromSI: (v) => v / 1000 },
  { value: 'g_L', label: 'g/L', toSI: (v) => Number(v), fromSI: (v) => v },
]

// 比焓/比内能：SI = J/kg
const enthalpyUnits = [
  { value: 'J_kg', label: 'J/kg', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'kJ_kg', label: 'kJ/kg', toSI: (v) => Number(v) * 1000, fromSI: (v) => v / 1000 },
]

// 比熵/比热容：SI = J/kg/K
const entropyUnits = [
  { value: 'J_kg_K', label: 'J/(kg·K)', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'kJ_kg_K', label: 'kJ/(kg·K)', toSI: (v) => Number(v) * 1000, fromSI: (v) => v / 1000 },
]

// 热导率：SI = W/m/K
const conductivityUnits = [
  { value: 'W_m_K', label: 'W/(m·K)', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'mW_m_K', label: 'mW/(m·K)', toSI: (v) => Number(v) / 1000, fromSI: (v) => v * 1000 },
]

// 动力粘度：SI = Pa·s
const viscosityUnits = [
  { value: 'Pa_s', label: 'Pa·s', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'mPa_s', label: 'mPa·s', toSI: (v) => Number(v) / 1000, fromSI: (v) => v * 1000 },
  { value: 'cP', label: 'cP', toSI: (v) => Number(v) / 1000, fromSI: (v) => v * 1000 },
]

// 比容：SI = m³/kg
const specificVolumeUnits = [
  { value: 'm3_kg', label: 'm³/kg', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'L_kg', label: 'L/kg', toSI: (v) => Number(v) / 1000, fromSI: (v) => v * 1000 },
  { value: 'cm3_g', label: 'cm³/g', toSI: (v) => Number(v) / 1000, fromSI: (v) => v * 1000 },
]

// 运动粘度：SI = m²/s（若 API 返回此项）
const kinematicViscosityUnits = [
  { value: 'm2_s', label: 'm²/s', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'mm2_s', label: 'mm²/s', toSI: (v) => Number(v) * 1e-6, fromSI: (v) => v / 1e-6 },
  { value: 'cSt', label: 'cSt', toSI: (v) => Number(v) * 1e-6, fromSI: (v) => v / 1e-6 },
]

// 音速：SI = m/s
const speedUnits = [
  { value: 'm_s', label: 'm/s', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'km_h', label: 'km/h', toSI: (v) => Number(v) / 3.6, fromSI: (v) => v * 3.6 },
]

// 无量纲（0–1）：不换算
const dimensionlessUnits = [{ value: '-', label: '(0~1)', toSI: (v) => Number(v), fromSI: (v) => v }]

// 含湿量：SI = kg/kg_da，常用 g/kg_da
const humidityRatioUnits = [
  { value: 'kg_kg', label: 'kg/kg_da', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'g_kg', label: 'g/kg_da', toSI: (v) => Number(v) / 1000, fromSI: (v) => v * 1000 },
]

// 相对湿度：0–1 或 %
const relativeHumidityUnits = [
  { value: 'frac', label: '0~1', toSI: (v) => Number(v), fromSI: (v) => v },
  { value: 'pct', label: '%', toSI: (v) => Number(v) / 100, fromSI: (v) => v * 100 },
]

/** 按物性代码获取可选单位列表（第一个为 API 使用的 SI 单位） */
export const UNITS_BY_PROPERTY = {
  T: tempUnits,
  T_freeze: tempUnits, // 冰点温度
  D: tempUnits,   // 露点温度
  B: tempUnits,   // 湿球温度
  P: pressureUnits,
  P_w: pressureUnits,
  Q: dimensionlessUnits,
  R: relativeHumidityUnits,
  H: enthalpyUnits,
  Hha: enthalpyUnits,
  S: entropyUnits,
  Sha: entropyUnits,
  C: entropyUnits,
  Cv: entropyUnits,
  Cha: entropyUnits,
  CVha: entropyUnits,
  Density: densityUnits,  // 用 D 会与露点冲突，密度用 key 'Density' 在 OUTPUT_PROPS 里对应 key 'D'
  D_rho: densityUnits,    // 流体密度单独 key，避免与湿空气露点 D 混淆
  U: enthalpyUnits,
  L: conductivityUnits,
  K: conductivityUnits,
  VISC: viscosityUnits,
  M: viscosityUnits,
  V: specificVolumeUnits,
  Vha: specificVolumeUnits,
  W: speedUnits,          // 流体音速
  W_ha: humidityRatioUnits, // 湿空气含湿量
  Z: dimensionlessUnits,
}

/** 流体物性 output_key 与单位类型映射（密度用 D_rho 区分） */
export function getUnitsForProperty(key) {
  if (key === 'D') {
    // 湿空气里 D 是露点温度；流体里 D 是密度
    return densityUnits
  }
  return UNITS_BY_PROPERTY[key] ?? UNITS_BY_PROPERTY.D_rho ?? dimensionlessUnits
}

/** 湿空气：D/B 是温度，W 是含湿量 */
export function getUnitsForHumidAirProperty(key) {
  if (key === 'T' || key === 'D' || key === 'B') return tempUnits
  if (key === 'P' || key === 'P_w') return pressureUnits
  if (key === 'R') return relativeHumidityUnits
  if (key === 'W') return humidityRatioUnits
  if (key === 'H' || key === 'Hha') return enthalpyUnits
  if (key === 'V' || key === 'Vha') return specificVolumeUnits
  if (key === 'S' || key === 'Sha' || key === 'C' || key === 'Cha' || key === 'CV' || key === 'CVha') return entropyUnits
  if (key === 'K') return conductivityUnits
  if (key === 'M') return viscosityUnits
  if (key === 'Z') return dimensionlessUnits
  return dimensionlessUnits
}

/** 流体物性（纯/不可压缩/混合）输入输出用 */
export function getUnitsForFluidProperty(key) {
  if (key === 'T' || key === 'T_freeze') return tempUnits
  if (key === 'P') return pressureUnits
  if (key === 'Q') return dimensionlessUnits
  if (key === 'D') return densityUnits
  if (key === 'H' || key === 'U') return enthalpyUnits
  if (key === 'S' || key === 'C' || key === 'Cv') return entropyUnits
  if (key === 'V') return specificVolumeUnits
  if (key === 'L' || key === 'K') return conductivityUnits
  if (key === 'VISC' || key === 'M') return viscosityUnits
  if (key === 'W') return speedUnits
  return dimensionlessUnits
}

/**
 * 将用户输入值从指定单位转为 API 所需 SI
 * @param {string} propKey - 物性代码 P, T, D, H, ...
 * @param {number|string} value - 用户输入值
 * @param {string} unitValue - 单位选项 value（如 'C', 'bar'）
 * @param {boolean} isHumidAir - 是否湿空气（D/B 为温度）
 */
export function toSI(propKey, value, unitValue, isHumidAir = false) {
  const list = isHumidAir ? getUnitsForHumidAirProperty(propKey) : getUnitsForFluidProperty(propKey)
  const u = list.find((x) => x.value === unitValue) || list[0]
  return u.toSI(value)
}

/**
 * 将 API 返回的 SI 值转为用户选择单位显示
 */
export function fromSI(propKey, siValue, unitValue, isHumidAir = false) {
  const list = isHumidAir ? getUnitsForHumidAirProperty(propKey) : getUnitsForFluidProperty(propKey)
  const u = list.find((x) => x.value === unitValue) || list[0]
  return u.fromSI(siValue)
}

/** 获取物性默认 SI 单位标签（用于显示） */
export function getDefaultUnitLabel(propKey, isHumidAir = false) {
  const list = isHumidAir ? getUnitsForHumidAirProperty(propKey) : getUnitsForFluidProperty(propKey)
  return list[0]?.label ?? '-'
}
