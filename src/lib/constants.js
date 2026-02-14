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

/** CoolProp 不可压缩纯流体（见 get_global_param_string("incompressible_list_pure")） */
export const INCOMP_PURE = ['DowJ', 'DowQ', 'Water', 'NBS', 'HC20', 'HC30', 'HC40', 'T66', 'TVP1', 'PCL']
/** 纯流体显示名 */
export const INCOMP_PURE_LABELS = {
  DowJ: 'DowJ Dowtherm J',
  DowQ: 'DowQ Dowtherm Q',
  Water: 'Water 水',
  NBS: 'NBS 水(标准)',
  HC20: 'HC20 Dynalene HC20',
  HC30: 'HC30 Dynalene HC30',
  HC40: 'HC40 Dynalene HC40',
  T66: 'T66 Therminol 66',
  TVP1: 'TVP1 Therminol VP1',
  PCL: 'PCL Paracryol',
}

/** CoolProp 不可压缩溶液（质量分数二元混合物，见 incompressible_list_solution）格式：INCOMP::名称[浓度] */
export const INCOMP_SOLUTIONS = ['LiBr', 'MEG', 'MPG', 'MEG2', 'MPG2', 'IcePG', 'IceEA']
/** 溶液显示名（CoolProp ID → 中文说明） */
export const INCOMP_SOLUTION_LABELS = {
  LiBr: 'LiBr 溴化锂水溶液',
  MEG: 'MEG 乙二醇水溶液',
  MPG: 'MPG 丙二醇水溶液',
  MEG2: 'MEG2 乙二醇(备选)',
  MPG2: 'MPG2 丙二醇(备选)',
  IcePG: 'IcePG 丙二醇冰点',
  IceEA: 'IceEA 乙醇胺冰点',
}

/** 流体物性输出代码，与 API_所有类别调用规则.md 2.2 节一致 */
export const OUTPUT_PROPS = [
  { key: 'D', label: '密度 D (kg/m³)' },
  { key: 'P', label: '压力 P (Pa)' },
  { key: 'T', label: '温度 T (K)' },
  { key: 'H', label: '比焓 H (J/kg)' },
  { key: 'S', label: '比熵 S (J/kg/K)' },
  { key: 'C', label: '比热容 Cp (J/kg/K)' },
  { key: 'L', label: '导热系数 (W/m/K)' },
  { key: 'V', label: '比容 V (m³/kg)' },
  { key: 'VISC', label: '动力粘度 μ (Pa·s)' },
  { key: 'T_freeze', label: '冰点 T_freeze (K)' },
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
  { key: 'C', label: '定压比热 Cp (J/kg_da·K)' },
  { key: 'Cha', label: '定压比热 Cha (J/kg_ha·K)' },
  { key: 'CV', label: '定容比热 Cv (J/kg_da·K)' },
  { key: 'CVha', label: '定容比热 Cv_ha (J/kg_ha·K)' },
  { key: 'K', label: '导热系数 K (W/m/K)' },
  { key: 'M', label: '动力粘度 μ (Pa·s)' },
  { key: 'Density', label: '密度 ρ (kg/m³)' },
]
