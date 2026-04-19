import clsx from 'clsx'
import { useWorkflowStore } from '../../store/workflowStore'
import { NODE_TYPE_CONFIG } from '../../types/workflow'

export const SimulationPanel = () => {
  const { 
    runSimulation, 
    clearSimulation, 
    simulationSteps, 
    simulationResult, 
    isSimulating, 
    nodes,
    validation
  } = useWorkflowStore()

  const hasNodes = nodes.length > 0
  const hasResult = simulationSteps.length > 0
  const isValid = validation.isValid

  return (
    <section className="h-44 flex-shrink-0 flex flex-col border-t border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#64748b" strokeWidth="1.3" />
              <path d="M8 5v3.5l2 1" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-slate-600">Simulate Execution</span>
          </div>
          
          <div className="h-4 w-px bg-slate-200" />

          {isValid ? (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Graph Valid
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Graph Invalid ({validation.errors.length})
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasResult && (
            <button
              onClick={clearSimulation}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors px-2"
            >
              Reset
            </button>
          )}
          <button
            onClick={runSimulation}
            disabled={isSimulating || !hasNodes || !isValid}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm',
              isSimulating || !hasNodes || !isValid
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            )}
          >
            {isSimulating ? (
              <>
                <svg className="animate-spin" width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20 10" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 3l10 5-10 5V3z" />
                </svg>
                Run Workflow
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Error List (if invalid) */}
        {!isValid && (
          <div className="w-1/3 border-r border-slate-100 bg-red-50/20 p-3 overflow-y-auto">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Errors Blocks Execution</p>
            <ul className="flex flex-col gap-1.5">
              {validation.errors.map((err, i) => (
                <li key={i} className="text-[11px] text-red-600 flex gap-2 items-start leading-tight">
                  <span className="mt-0.5">•</span>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps area */}
        <div className={clsx('flex-1 overflow-x-auto overflow-y-hidden bg-white', !isValid && 'bg-slate-50/30')}>
          {!hasResult && !isSimulating ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              {isValid ? (
                <>
                  <p className="text-xs text-slate-400">Press Run to simulate traversal</p>
                  <p className="text-[10px] text-slate-300">Execution starts from the Start node</p>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Please resolve graph errors to enable simulation</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-4 h-full">
              {simulationSteps.map((step, i) => {
                const config = NODE_TYPE_CONFIG[step.nodeType]
                return (
                  <div key={step.nodeId} className="flex items-center gap-2 flex-shrink-0 animate-fade-in-up">
                    <div className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-300 shadow-sm',
                      step.status === 'success'
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    )}>
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.iconBg }}
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill={config.color}>
                          <circle cx="8" cy="8" r="5" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold whitespace-nowrap leading-none">{step.nodeLabel}</span>
                        <span className="text-[9px] opacity-60 uppercase font-bold tracking-tight">{config.tag}</span>
                      </div>
                      <span className={clsx(
                        'text-[9px] font-bold px-1 py-0.5 rounded uppercase ml-1',
                        step.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      )}>
                        {step.status === 'success' ? `${step.duration}ms` : 'err'}
                      </span>
                    </div>
                    {i < simulationSteps.length - 1 && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-300">
                        <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                )
              })}
              {isSimulating && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50 flex-shrink-0 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
