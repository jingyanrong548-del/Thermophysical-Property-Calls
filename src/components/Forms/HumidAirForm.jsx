import { useState, useEffect } from 'react'
import { HA_INPUT_OPTIONS, HA_OUTPUT_OPTIONS } from '../../lib/constants'
import { toSI, fromSI, getUnitsForHumidAirProperty } from '../../lib/units'

function formatInputValue(num) {
  const n = Number(num)
  if (Number.isNaN(n)) return ''
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4)
  return Math.round(n) === n ? String(n) : String(Number(n.toFixed(8)))
}

export default function HumidAirForm({ onQuery, result, error, loading, onResultUnitChange }) {
  const [output, setOutput] = useState('W')
  const [p1, setP1] = useState('T')
  const [v1, setV1] = useState('298.15')
  const [p2, setP2] = useState('P')
  const [v2, setV2] = useState('101325')
  const [p3, setP3] = useState('R')
  const [v3, setV3] = useState('0.5')
  const [u1, setU1] = useState(getUnitsForHumidAirProperty('T')[0].value)
  const [u2, setU2] = useState(getUnitsForHumidAirProperty('P')[0].value)
  const [u3, setU3] = useState(getUnitsForHumidAirProperty('R')[0].value)
  const [outputUnit, setOutputUnit] = useState(getUnitsForHumidAirProperty('W')[0].value)

  const used = [p1, p2, p3]
  const available = (key) => !used.includes(key) || used.filter((k) => k === key).length === 1
  const unitsOut = getUnitsForHumidAirProperty(output)
  useEffect(() => {
    const list1 = getUnitsForHumidAirProperty(p1)
    if (!list1.some((x) => x.value === u1)) setU1(list1[0]?.value ?? u1)
  }, [p1])
  useEffect(() => {
    const list2 = getUnitsForHumidAirProperty(p2)
    if (!list2.some((x) => x.value === u2)) setU2(list2[0]?.value ?? u2)
  }, [p2])
  useEffect(() => {
    const list3 = getUnitsForHumidAirProperty(p3)
    if (!list3.some((x) => x.value === u3)) setU3(list3[0]?.value ?? u3)
  }, [p3])
  useEffect(() => {
    const listOut = getUnitsForHumidAirProperty(output)
    if (!listOut.some((x) => x.value === outputUnit)) setOutputUnit(listOut[0]?.value ?? outputUnit)
  }, [output])

  const handleSubmit = (e) => {
    e.preventDefault()
    const si1 = toSI(p1, v1, u1, true)
    const si2 = toSI(p2, v2, u2, true)
    const si3 = toSI(p3, v3, u3, true)
    onQuery({
      output_key: output,
      output_unit: outputUnit,
      input1_key: p1,
      input1_value: si1,
      input2_key: p2,
      input2_value: si2,
      input3_key: p3,
      input3_value: si3,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-400">Type 5 湿空气：输入 3 个独立状态参数，计算指定输出量。</p>
      <div>
        <label className="mb-1 block text-sm text-stone-400">输出量</label>
        <select
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {HA_OUTPUT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      {[
        { param: p1, setParam: setP1, val: v1, setVal: setV1, unit: u1, setUnit: setU1 },
        { param: p2, setParam: setP2, val: v2, setVal: setV2, unit: u2, setUnit: setU2 },
        { param: p3, setParam: setP3, val: v3, setVal: setV3, unit: u3, setUnit: setU3 },
      ].map(({ param, setParam, val, setVal, unit, setUnit }, i) => {
        const opts = getUnitsForHumidAirProperty(param)
        return (
          <div key={i} className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm text-stone-400">参数 {i + 1}</label>
              <select
                value={param}
                onChange={(e) => setParam(e.target.value)}
                className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {HA_INPUT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} disabled={!available(o.key)}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-sm text-stone-400">值</label>
                <input
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-sm text-stone-400">单位</label>
                <select
                  value={unit}
                  onChange={(e) => {
                    const newUnit = e.target.value
                    const si = toSI(param, val, unit, true)
                    const converted = fromSI(param, si, newUnit, true)
                    setUnit(newUnit)
                    setVal(formatInputValue(converted))
                  }}
                  className="w-full rounded-lg border border-stone-600 bg-stone-900 px-2 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {opts.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )
      })}
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
