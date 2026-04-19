import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import clsx from 'clsx'
import type { NodeData, NodeType } from '../../types/workflow'
import { NODE_TYPE_CONFIG } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'

interface BaseNodeProps extends NodeProps<NodeData> {
  nodeType: NodeType
  icon: React.ReactNode
  showSource?: boolean
  showTarget?: boolean
}

const StatusIndicator = ({ status }: { status: NodeData['status'] }) => {
  const map = {
    idle:    { dot: 'bg-slate-300',   label: 'idle' },
    running: { dot: 'bg-amber-400 animate-pulse', label: 'running' },
    success: { dot: 'bg-emerald-500', label: 'done' },
    error:   { dot: 'bg-red-500',     label: 'error' },
  }
  const { dot, label } = map[status]
  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  )
}

export const BaseNode = memo(({
  id,
  selected,
  data,
  nodeType,
  icon,
  showSource = true,
  showTarget = true,
}: BaseNodeProps) => {
  const config = NODE_TYPE_CONFIG[nodeType]
  const deleteNode = useWorkflowStore(s => s.deleteNode)
  const duplicateNode = useWorkflowStore(s => s.duplicateNode)

  const isRunning = data.status === 'running'
  const isSuccess = data.status === 'success'
  const isInvalid = data.isInvalid

  return (
    <div
      className={clsx(
        'relative w-44 rounded-xl border bg-white transition-all duration-150 group',
        'shadow-sm hover:shadow-md cursor-pointer select-none',
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md'
          : isInvalid
          ? 'border-red-400 ring-2 ring-red-100 shadow-sm animate-shake'
          : isSuccess
          ? 'border-emerald-400'
          : isRunning
          ? 'border-amber-400 ring-2 ring-amber-100'
          : 'border-slate-200 hover:border-slate-300',
      )}
    >
      {/* Top action bar — visible on hover/select */}
      <div className={clsx(
        'absolute -top-7 right-0 flex gap-1 transition-opacity duration-150',
        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}>
        <button
          onClick={e => { e.stopPropagation(); duplicateNode(id) }}
          className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm"
        >
          copy
        </button>
        <button
          onClick={e => { e.stopPropagation(); deleteNode(id) }}
          className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 shadow-sm"
        >
          del
        </button>
      </div>

      {showTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !border-2 !border-white !bg-slate-400 hover:!bg-indigo-500 transition-colors"
        />
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.iconBg }}
          >
            {icon}
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
            {data.label}
          </p>
        </div>

        {/* Meta info */}
        <p className="text-[10px] text-slate-400 mb-2 line-clamp-1">{data.meta}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <StatusIndicator status={data.status} />
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{ backgroundColor: config.iconBg, color: config.color }}
          >
            {config.tag}
          </span>
        </div>
      </div>

      {showSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !border-2 !border-white !bg-slate-400 hover:!bg-indigo-500 transition-colors"
        />
      )}
    </div>
  )
})

BaseNode.displayName = 'BaseNode'
