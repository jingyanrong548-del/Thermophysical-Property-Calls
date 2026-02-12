import { useState, useEffect } from 'react'
import { INCOMP_PURE, INCOMP_PURE_LABELS, OUTPUT_PROPS, INPUT_PAIRS } from '../../lib/constants'
import { toSI, fromSI, getUnitsForFluidProperty } from '../../lib/units'

const sel = (key) => getUnitsForFluidProperty(key)

function formatInputValue(num) {
  const n = Number(num)
  if (Number.isNaN(n)) return ''
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4)
  return Math.round(n) === n ? String(n) : String(Number(n.toFixed(8)))
}

export default function IncompPureForm({ onQuery, result, error, loading, onResultUnitChange }) {
  const [fluid, setFluid] = useState(INCOMP_PURE[0])
  const [output, setOutput] = useState('D')
  const [inputPair, setInputPair] = useState(INPUT_PAIRS[0])
  const [val1, setVal1] = useState('300')
  const [val2, setVal2] = useState('101325')
  const [unit1, setUnit1] = useState(sel('T')[0].value)
  const [unit2, setUnit2] = useState(sel('P')[0].value)
  const [outputUnit, setOutputUnit] = useState(sel('D')[0].value)

  const fluidString = `INCOMP::${fluid.trim()}`
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const si1 = toSI(inputPair.k1, val1, unit1, false)
    const si2 = toSI(inputPair.k2, val2, unit2, false)
    onQuery({
      fluidType: 2,
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
        <label className="mb-1 block text-sm text-stone-400">工质 (Type 2 INCOMP::)</label>
        <select
          value={fluid}
          onChange={(e) => setFluid(e.target.value)}
          className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {INCOMP_PURE.map((f) => (
            <option key={f} value={f}>{INCOMP_PURE_LABELS[f] ?? `INCOMP::${f}`}</option>
          ))}
        </select>
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
        disabled={loading}
        className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-stone-900 hover:bg-amber-400 disabled:opacity-50"
      >
        计算
      </button>
    </form>
  )
}
