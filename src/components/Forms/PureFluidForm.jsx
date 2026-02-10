import { useState } from 'react'
import { PURE_FLUIDS, OUTPUT_PROPS, INPUT_PAIRS } from '../../lib/constants'

export default function PureFluidForm({ onQuery, result, error, loading }) {
  const [fluid, setFluid] = useState(PURE_FLUIDS[0])
  const [output, setOutput] = useState('D')
  const [inputPair, setInputPair] = useState(INPUT_PAIRS[0])
  const [val1, setVal1] = useState('300')
  const [val2, setVal2] = useState('101325')

  const fluidString = fluid.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    onQuery({
      fluidType: 1,
      fluid: fluidString,
      output_key: output,
      input1_key: inputPair.k1,
      input1_value: val1,
      input2_key: inputPair.k2,
      input2_value: val2,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-stone-400">工质 (Type 1 纯流体)</label>
        <select
          value={fluid}
          onChange={(e) => setFluid(e.target.value)}
          className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {PURE_FLUIDS.map((f) => (
            <option key={f} value={f}>{f}</option>
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
          <input
            type="number"
            step="any"
            value={val1}
            onChange={(e) => setVal1(e.target.value)}
            className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-400">{inputPair.k2}</label>
          <input
            type="number"
            step="any"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            className="w-full rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
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
