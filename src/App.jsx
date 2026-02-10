import { useState } from 'react'
import { FLUID_TYPES } from './lib/constants'
import { useCoolProp } from './hooks/useCoolProp'
import ResultCard from './components/ResultCard'
import PureFluidForm from './components/Forms/PureFluidForm'
import IncompPureForm from './components/Forms/IncompPureForm'
import IncompSolutionForm from './components/Forms/IncompSolutionForm'
import HeosMixtureForm from './components/Forms/HeosMixtureForm'
import HumidAirForm from './components/Forms/HumidAirForm'

export default function App() {
  const [activeType, setActiveType] = useState(1)
  const { result, error, loading, queryProps, queryHumidAir } = useCoolProp()

  const handleQueryProps = (params) => queryProps(params)
  const handleQueryHumidAir = (params) => queryHumidAir(params)

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="border-b border-stone-800 bg-stone-900/50 px-6 py-4">
        <h1 className="font-sans text-xl font-semibold text-stone-100">
          Thermophysical Property — CoolProp 物性查询
        </h1>
        <p className="mt-1 text-sm text-stone-400">五大工质分类 · 统一规则</p>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs: 5 大类 */}
        <nav className="mb-6 flex flex-wrap gap-2 border-b border-stone-700 pb-4">
          {FLUID_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeType === t.id
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-stone-700 bg-stone-900/30 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">
              输入
            </h2>
            {activeType === 1 && <PureFluidForm onQuery={handleQueryProps} />}
            {activeType === 2 && <IncompPureForm onQuery={handleQueryProps} />}
            {activeType === 3 && <IncompSolutionForm onQuery={handleQueryProps} />}
            {activeType === 4 && <HeosMixtureForm onQuery={handleQueryProps} />}
            {activeType === 5 && <HumidAirForm onQuery={handleQueryHumidAir} />}
          </section>

          <section className="rounded-xl border border-stone-700 bg-stone-900/30 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">
              结果
            </h2>
            <ResultCard result={result} error={error} loading={loading} />
          </section>
        </div>
      </div>
    </div>
  )
}
