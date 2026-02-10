import { fromSI, getUnitsForFluidProperty, getUnitsForHumidAirProperty } from '../lib/units'

function getDisplayValueAndUnit(result, resultUnitOverride) {
  const raw = result.value ?? result.result
  const key = result.output_key
  const isHumidAir = result.isHumidAir === true
  const list = key ? (isHumidAir ? getUnitsForHumidAirProperty(key) : getUnitsForFluidProperty(key)) : []
  const userUnit = (resultUnitOverride && list.some((x) => x.value === resultUnitOverride))
    ? resultUnitOverride
    : result.output_unit
  if (userUnit && key && typeof raw === 'number') {
    const u = list.find((x) => x.value === userUnit)
    if (u) {
      return { value: u.fromSI(raw), unit: u.label }
    }
  }
  return { value: raw, unit: result.unit ?? '-' }
}

export default function ResultCard({ result, error, loading, resultUnit }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <span className="text-amber-400">计算中…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
        <p className="font-medium">错误</p>
        <p className="mt-1 text-sm opacity-90">{error}</p>
      </div>
    )
  }
  if (!result) return null
  const { value, unit } = getDisplayValueAndUnit(result, resultUnit)
  const desc = result.description ?? result.output_key ?? 'result'
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
      <p className="text-sm text-stone-400">{desc}</p>
      <p className="mt-1 text-2xl font-semibold text-emerald-400">
        {typeof value === 'number' ? value.toLocaleString() : value}
        <span className="ml-2 text-base font-normal text-stone-400">{unit}</span>
      </p>
    </div>
  )
}
