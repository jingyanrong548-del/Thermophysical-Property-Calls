import { useState, useEffect } from 'react'
import { PURE_FLUIDS, OUTPUT_PROPS, INPUT_PAIRS } from '../../lib/constants'
import { buildFluidString } from '../../hooks/useCoolProp'
import { toSI, fromSI, getUnitsForFluidProperty } from '../../lib/units'

const sel = (key) => getUnitsForFluidProperty(key)

function formatInputValue(num) {
  const n = Number(num)
  if (Number.isNaN(n)) return ''
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4)
  return Math.round(n) === n ? String(n) : String(Number(n.toFixed(8)))
}

const DEFAULT_MIX = [
  { name: 'R32', fraction: 0.697615 },
  { name: 'R125', fraction: 0.302385 },
]

export default function HeosMixtureForm({ onQuery, result, error, loading, onResultUnitChange }) {
  const [parts, setParts] = useState(DEFAULT_MIX)
  const [output, setOutput] = useState('D')
  const [inputPair, setInputPair] = useState(INPUT_PAIRS[0])
  const [val1, setVal1] = useState('300')
  const [val2, setVal2] = useState('101325')
  const [unit1, setUnit1] = useState(sel('T')[0].value)
  const [unit2, setUnit2] = useState(sel('P')[0].value)
  const [outputUnit, setOutputUnit] = useState(sel('D')[0].value)

  const fluidString = buildFluidString(4, null, null, parts)
  const sum = parts.reduce((s, p) => s + (p.fraction || 0), 0)
  const validMix = parts.length >= 2 && Math.abs(sum - 1) < 0.001
  const units1 = sel(inputPair.k1)
  const units2 = sel(inputPair.k2)
  const unitsOut = sel(output)
  useEffect(() => {
    if (!units1.some((u) => u.value === unit1)) setUnit1(units1[0]?.value ?? unit1)
    if (!units2.some((u) => u.value === unit2)) setUnit2(units2[0]?.value ?? unit2)
  }, [inputPair.k1, inputPair.k2])
  useEffect(() => {
    if (!unitsOut.some((u) => u.value === outputUnit)) setOutputUnit(unitsOut[0]?.value ?? outputUnit)
  }, [output])

  const updatePart = (i, field, value) => {
    const next = [...parts]
    if (field === 'name') next[i].name = value
    else next[i].fraction = Math.max(0, Math.min(1, Number(value) || 0))
    setParts(next)
  }

  const addPart = () => setParts([...parts, { name: PURE_FLUIDS[0], fraction: 0 }])
  const removePart = (i) => setParts(parts.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validMix) return
    const si1 = toSI(inputPair.k1, val1, unit1, false)
    const si2 = toSI(inputPair.k2, val2, unit2, false)
    onQuery({
      fluidType: 4,
      fluid: fluidString,
      output_key: output,
      output_unit: outputUnit,
      input1_key: inputPair.k1,
      input1_value: si1,
      input2_key: inputPair.k2,
      input2_value: si2,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-stone-400">混合物组分 (HEOS:: 摩尔分数之和=1)</label>
        {parts.map((p, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <select
              value={p.name}
              onChange={(e) => updatePart(i, 'name', e.target.value)}
              className="flex-1 rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {PURE_FLUIDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={p.fraction}
              onChange={(e) => updatePart(i, 'fraction', e.target.value)}
              className="w-24 rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="0–1"
            />
            {parts.length > 2 && (
              <button type="button" onClick={() => removePart(i)} className="rounded-lg border border-stone-600 px-2 text-stone-400 hover:bg-stone-800">
                删
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addPart} className="text-sm text-amber-400 hover:underline">+ 添加组分</button>
        {parts.length >= 2 && (
          <p className={`mt-1 text-sm ${Math.abs(sum - 1) < 0.001 ? 'text-emerald-400' : 'text-amber-400'}`}>
            摩尔分数和 = {sum.toFixed(4)} {Math.abs(sum - 1) < 0.001 ? '✓' : '(需为 1)'}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-400">输出量</label>
        <select
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {OUTPUT_PROPS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-400">状态参数对</label>
        <select
          value={INPUT_PAIRS.findIndex((p) => p.k1 === inputPair.k1 && p.k2 === inputPair.k2)}
          onChange={(e) => setInputPair(INPUT_PAIRS[Number(e.target.value)])}
          className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {INPUT_PAIRS.map((p, i) => (
            <option key={i} value={i}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-stone-400">{inputPair.k1}</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              className="flex-1 rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <select
              value={unit1}
              onChange={(e) => {
                const newUnit = e.target.value
                const si = toSI(inputPair.k1, val1, unit1, false)
                const converted = fromSI(inputPair.k1, si, newUnit, false)
                setUnit1(newUnit)
                setVal1(formatInputValue(converted))
              }}
              className="w-24 rounded-lg border border-stone-600 bg-stone-900 px-2 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {units1.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-400">{inputPair.k2}</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
              className="flex-1 rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <select
              value={unit2}
              onChange={(e) => {
                const newUnit = e.target.value
                const si = toSI(inputPair.k2, val2, unit2, false)
                const converted = fromSI(inputPair.k2, si, newUnit, false)
                setUnit2(newUnit)
                setVal2(formatInputValue(converted))
              }}
              className="w-24 rounded-lg border border-stone-600 bg-stone-900 px-2 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {units2.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-400">结果单位</label>
        <select
          value={outputUnit}
          onChange={(e) => {
            const u = e.target.value
            setOutputUnit(u)
            onResultUnitChange?.(u)
          }}
          className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {unitsOut.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !validMix}
        className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-stone-900 hover:bg-amber-400 disabled:opacity-50"
      >
        计算
      </button>
    </form>
  )
}
