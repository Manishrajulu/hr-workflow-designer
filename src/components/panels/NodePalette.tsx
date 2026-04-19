import type { DragEvent } from 'react'
import clsx from 'clsx'
import type { NodeType } from '../../types/workflow'
import { NODE_TYPE_CONFIG } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { getWorkflowTemplates } from '../../api/mockApi'
import { useEffect, useState } from 'react'
import type { Automation } from '../../types/workflow'

const NODE_ORDER: NodeType[] = ['start', 'task', 'approval', 'automated', 'end']

const nodeIcons: Record<NodeType, React.ReactNode> = {
  start: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" fill="#16a34a" />
      <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="white" />
    </svg>
  ),
  task: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="2" fill="#1d4ed8" />
      <path d="M5 7h6M5 9.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  approval: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2l2 4h4l-3 2.5 1 4L8 10l-4 2.5 1-4L2 6h4z" fill="#c2410c" />
    </svg>
  ),
  automated: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="#7c3aed" strokeWidth="1.4" />
      <path d="M8 4.5v3.5l2.5 1.2" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  end: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" fill="#be185d" />
      <rect x="5.5" y="5.5" width="5" height="5" rx="1" fill="white" />
    </svg>
  ),
}

interface NodePaletteProps {
  onDragStart: (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => void
}

export const NodePalette = ({ onDragStart }: NodePaletteProps) => {
  const { loadTemplate, workflowName, setWorkflowName, clearCanvas } = useWorkflowStore()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTemplate, setActiveTemplate] = useState<string | null>('wf-onboarding')

  useEffect(() => {
    getWorkflowTemplates().then(data => {
      setAutomations(data) 
      setLoading(false)
    })
  }, [])

  const handleLoadTemplate = (automation: Automation) => {
    loadTemplate(automation.id, automation.nodes as never, automation.edges)
    setActiveTemplate(automation.id)
    setWorkflowName(automation.name)
  }

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto">
      {/* Section: Nodes */}
      <div className="p-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
          Node Types
        </p>
        <div className="flex flex-col gap-1.5">
          {NODE_ORDER.map(type => {
            const config = NODE_TYPE_CONFIG[type]
            return (
              <div
                key={type}
                draggable
                onDragStart={e => onDragStart(e, type)}
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-grab active:cursor-grabbing',
                  'border-slate-200 bg-white transition-all duration-150',
                  'hover:border-slate-300 hover:bg-slate-50 hover:translate-x-0.5',
                  'active:scale-95'
                )}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: config.iconBg }}
                >
                  {nodeIcons[type]}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">{config.label}</p>
                  <p className="text-[10px] text-slate-400">{config.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section: Templates */}
      <div className="p-3 flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
          Templates
        </p>
        {loading ? (
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {automations.map(automation => (
              <button
                key={automation.id}
                onClick={() => handleLoadTemplate(automation)}
                className={clsx(
                  'w-full text-left px-2.5 py-2 rounded-lg border transition-all duration-150',
                  activeTemplate === automation.id
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <p className="text-xs font-medium leading-tight">{automation.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{automation.description}</p>
              </button>
            ))}
            <button
              onClick={() => { clearCanvas(); setActiveTemplate(null); setWorkflowName('Untitled Workflow') }}
              className="w-full text-left px-2.5 py-2 rounded-lg border border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all duration-150"
            >
              <p className="text-xs">+ Blank canvas</p>
            </button>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="p-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Drag nodes onto the canvas. Connect them by dragging from one handle to another.
        </p>
      </div>
    </aside>
  )
}
