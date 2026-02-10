import { useState } from 'react'
import { HA_INPUT_OPTIONS, HA_OUTPUT_OPTIONS } from '../../lib/constants'

export default function HumidAirForm({ onQuery, result, error, loading }) {
  const [output, setOutput] = useState('W')
  const [p1, setP1] = useState('T')
  const [v1, setV1] = useState('298.15')
  const [p2, setP2] = useState('P')
  const [v2, setV2] = useState('101325')
  const [p3, setP3] = useState('R')
  const [v3, setV3] = useState('0.5')

  const used = [p1, p2, p3]
  const available = (key) => !used.includes(key) || used.filter((k) => k === key).length === 1

  const handleSubmit = (e) => {
    e.preventDefault()
    onQuery({
      output_key: output,
      input1_key: p1,
      input1_value: v1,
      input2_key: p2,
      input2_value: v2,
      input3_key: p3,
      input3_value: v3,
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
        { param: p1, setParam: setP1, val: v1, setVal: setV1 },
        { param: p2, setParam: setP2, val: v2, setVal: setV2 },
        { param: p3, setParam: setP3, val: v3, setVal: setV3 },
      ].map(({ param, setParam, val, setVal }, i) => (
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
          <div>
            <label className="mb-1 block text-sm text-stone-400">值 (SI)</label>
            <input
              type="number"
              step="any"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      ))}
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
