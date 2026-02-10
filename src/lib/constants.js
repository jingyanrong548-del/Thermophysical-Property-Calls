/**
 * 五大工质分类选项 — 与 API_所有类别调用规则.md 一致
 */

export const FLUID_TYPES = [
  { id: 1, label: '纯流体', key: 'pure', prefix: '' },
  { id: 2, label: '不可压缩纯流体', key: 'incomp_pure', prefix: 'INCOMP::' },
  { id: 3, label: '不可压缩溶液', key: 'incomp_solution', prefix: 'INCOMP::' },
  { id: 4, label: '可压缩混合物 (HEOS)', key: 'heos', prefix: 'HEOS::' },
  { id: 5, label: '湿空气', key: 'humid_air', prefix: null },
]

export const PURE_FLUIDS = ['Water', 'R134a', 'R410A', 'R32', 'R125', 'Air', 'CO2', 'Nitrogen', 'Oxygen', 'Ethanol', 'Ammonia']

export const INCOMP_PURE = ['DowJ', 'DowQ', 'Methanol', 'Ethanol', 'EG', 'PC', 'PAG', 'TEC', 'ICP', 'HC']

/** CoolProp 不可压缩溶液名（浓度由用户输入 mass_fraction） */
export const INCOMP_SOLUTIONS = ['LiBr', 'EG', 'Water', 'Methanol', 'Ethanol']

export const OUTPUT_PROPS = [
  { key: 'D', label: '密度 D (kg/m³)' },
  { key: 'P', label: '压力 P (Pa)' },
  { key: 'T', label: '温度 T (K)' },
  { key: 'H', label: '比焓 H (J/kg)' },
  { key: 'S', label: '比熵 S (J/kg/K)' },
  { key: 'C', label: '比热容 Cp (J/kg/K)' },
  { key: 'L', label: '导热系数 (W/m/K)' },
  { key: 'V', label: '动力粘度 (m²/s)' },
  { key: 'M', label: '动力粘度 μ (Pa·s)' },
]

export const INPUT_PAIRS = [
  { k1: 'T', k2: 'P', label: 'T (K) + P (Pa)' },
  { k1: 'T', k2: 'D', label: 'T (K) + D (kg/m³)' },
  { k1: 'P', k2: 'D', label: 'P (Pa) + D (kg/m³)' },
  { k1: 'P', k2: 'H', label: 'P (Pa) + H (J/kg)' },
  { k1: 'T', k2: 'Q', label: 'T (K) + Q (干度 0~1)' },
]

/** 湿空气：3 个独立状态参数 */
export const HA_INPUT_OPTIONS = [
  { key: 'T', label: '干球温度 T (K)' },
  { key: 'P', label: '压力 P (Pa)' },
  { key: 'R', label: '相对湿度 R (0~1)' },
  { key: 'W', label: '含湿量 W (kg_w/kg_da)' },
  { key: 'H', label: '比焓 H (J/kg_da)' },
  { key: 'B', label: '湿球温度 T_wb (K)' },
  { key: 'D', label: '露点温度 T_dp (K)' },
]

export const HA_OUTPUT_OPTIONS = [
  { key: 'W', label: '含湿量 W' },
  { key: 'D', label: '露点温度 T_dp' },
  { key: 'H', label: '比焓 H' },
  { key: 'B', label: '湿球温度 T_wb' },
  { key: 'R', label: '相对湿度 R' },
  { key: 'V', label: '比容 v' },
]
