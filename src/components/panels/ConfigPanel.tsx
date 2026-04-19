import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useWorkflowStore } from '../../store/workflowStore'
import type { NodeData } from '../../types/workflow'
import { NODE_TYPE_CONFIG } from '../../types/workflow'
import { getAutomations } from '../../api/mockApi'
import type { AutomationAction } from '../../api/mockApi'
import { KeyValueEditor } from '../ui/KeyValueEditor'

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

const Field = ({ label, error, children }: FieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium text-slate-500">{label}</label>
    {children}
    {error && (
      <p className="text-[10px] text-red-500 flex items-center gap-1">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 9a1 1 0 100 2 1 1 0 000-2zm-.75-5v4h1.5V5h-1.5z" />
        </svg>
        {error}
      </p>
    )}
  </div>
)

const inputCls = (error?: string) =>
  clsx(
    'w-full px-2.5 py-1.5 rounded-lg border text-xs text-slate-700 outline-none transition-all duration-150',
    'placeholder:text-slate-300 bg-white',
    error
      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
      : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
  )

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-6 mb-2 first:mt-0">
    {children}
  </p>
)

type FormErrors = Partial<Record<keyof NodeData, string>>

export const ConfigPanel = () => {
  const { selectedNodeId, nodes, updateNodeData, deleteNode } = useWorkflowStore()
  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const [form, setForm] = useState<Partial<NodeData>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)
  const [automationActions, setAutomationActions] = useState<AutomationAction[]>([])

  useEffect(() => {
    getAutomations().then(setAutomationActions)
  }, [])

  useEffect(() => {
    if (selectedNode) {
      setForm({ ...selectedNode.data })
      setErrors({})
      setSaved(false)
    }
  }, [selectedNodeId, selectedNode])

  if (!selectedNode) {
    return (
      <aside className="w-64 flex-shrink-0 flex flex-col items-center justify-center bg-white border-l border-slate-200 p-6 gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Click a node on the canvas to configure its properties
        </p>
      </aside>
    )
  }

  const config = NODE_TYPE_CONFIG[selectedNode.type]

  const set = (key: keyof NodeData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!form.label?.trim()) newErrors.label = 'Title is required'
    if (selectedNode.type === 'approval' && (!form.threshold || Number(form.threshold) < 1)) {
      newErrors.threshold = 'Must be at least 1'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApply = () => {
    if (!validate()) return
    updateNodeData(selectedNode.id, form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectedAction = automationActions.find(a => a.id === form.actionType)

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div>
          <p className="text-xs font-semibold text-slate-700">Configuration</p>
          <p className="text-[10px] text-slate-400 mt-0.5 max-w-[120px] truncate">{selectedNode.data.label}</p>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
          style={{ backgroundColor: config.iconBg, color: config.color }}
        >
          {config.tag}
        </span>
      </div>

      {/* Form body */}
      <div className="p-4 flex flex-col gap-4 flex-1">
        <section>
          <SectionHeader>General</SectionHeader>
          <div className="flex flex-col gap-3">
            <Field label="Title" error={errors.label}>
              <input
                className={inputCls(errors.label)}
                value={form.label ?? ''}
                onChange={e => set('label', e.target.value)}
                placeholder="Node title"
              />
            </Field>

            <Field label="Description">
              <textarea
                className={clsx(inputCls(), 'resize-none min-h-[60px]')}
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
                placeholder="What does this step do?"
              />
            </Field>
          </div>
        </section>

        {/* Start-specific */}
        {selectedNode.type === 'start' && (
          <section>
            <SectionHeader>Custom Metadata</SectionHeader>
            <KeyValueEditor
              pairs={form.customFields ?? []}
              onChange={pairs => setForm(prev => ({ ...prev, customFields: pairs }))}
            />
          </section>
        )}

        {/* Task-specific */}
        {selectedNode.type === 'task' && (
          <section>
            <SectionHeader>Task Details</SectionHeader>
            <div className="flex flex-col gap-3">
              <Field label="Assignee">
                <input
                  className={inputCls()}
                  value={form.assignee ?? ''}
                  onChange={e => set('assignee', e.target.value)}
                  placeholder="e.g. HR Admin"
                />
              </Field>
              <Field label="Due Date">
                <input
                  type="date"
                  className={inputCls()}
                  value={form.dueDate ?? ''}
                  onChange={e => set('dueDate', e.target.value)}
                />
              </Field>
              <SectionHeader>Custom Fields</SectionHeader>
              <KeyValueEditor
                pairs={form.customFields ?? []}
                onChange={pairs => setForm(prev => ({ ...prev, customFields: pairs }))}
              />
            </div>
          </section>
        )}

        {/* Approval-specific */}
        {selectedNode.type === 'approval' && (
          <section>
            <SectionHeader>Approval Settings</SectionHeader>
            <div className="flex flex-col gap-3">
              <Field label="Approver Role">
                <select
                  className={inputCls()}
                  value={form.approverRole ?? 'Line Manager'}
                  onChange={e => set('approverRole', e.target.value)}
                >
                  <option>Line Manager</option>
                  <option>HR Director</option>
                  <option>Finance Director</option>
                  <option>Department Head</option>
                  <option>C-Suite</option>
                </select>
              </Field>
              <Field label="Approval Threshold" error={errors.threshold}>
                <input
                  type="number"
                  className={inputCls(errors.threshold)}
                  value={form.threshold ?? 1}
                  min={1}
                  max={10}
                  onChange={e => set('threshold', parseInt(e.target.value))}
                />
              </Field>
            </div>
          </section>
        )}

        {/* Automated-specific */}
        {selectedNode.type === 'automated' && (
          <section>
            <SectionHeader>Automation Settings</SectionHeader>
            <div className="flex flex-col gap-3">
              {automationActions.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Loading actions...</p>
              ) : (
                <>
                  <Field label="Action Type">
                    <select
                      className={inputCls()}
                      value={form.actionType ?? ''}
                      onChange={e => {
                        setForm(prev => ({
                          ...prev,
                          actionType: e.target.value,
                          actionParams: {}
                        }))
                      }}
                    >
                      <option value="" disabled>Select an action...</option>
                      {automationActions.map(a => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </Field>

                  {selectedAction && selectedAction.params.map(param => (
                    <Field key={param} label={param.charAt(0).toUpperCase() + param.slice(1)}>
                      <input
                        className={inputCls()}
                        value={form.actionParams?.[param] ?? ''}
                        onChange={e => {
                          const newParams = { ...(form.actionParams || {}), [param]: e.target.value }
                          set('actionParams', newParams)
                        }}
                        placeholder={`Enter ${param}`}
                      />
                    </Field>
                  ))}
                </>
              )}
            </div>
          </section>
        )}

        {/* End-specific */}
        {selectedNode.type === 'end' && (
          <section>
            <SectionHeader>Terminal Settings</SectionHeader>
            <div className="flex flex-col gap-3">
              <Field label="End Message">
                <textarea
                  className={clsx(inputCls(), 'resize-none min-h-[80px]')}
                  value={form.endMessage ?? ''}
                  onChange={e => set('endMessage', e.target.value)}
                  placeholder="Workflow completion message..."
                />
              </Field>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="summaryFlag"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.summaryFlag ?? false}
                  onChange={e => set('summaryFlag', e.target.checked)}
                />
                <label htmlFor="summaryFlag" className="text-[11px] text-slate-600 font-medium cursor-pointer">
                  Attach execution summary to completion
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Connections info */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <SectionHeader>Metadata</SectionHeader>
          <div className="bg-slate-50 rounded-lg p-2 flex flex-col gap-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Node ID:</span>
              <span className="font-mono text-slate-600">{selectedNode.id}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Connections:</span>
              <span className="text-slate-600">
                {useWorkflowStore.getState().edges.filter(e => e.source === selectedNode.id).length} out /&nbsp;
                {useWorkflowStore.getState().edges.filter(e => e.target === selectedNode.id).length} in
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
        <button
          onClick={handleApply}
          className={clsx(
            'w-full py-2 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm',
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98'
          )}
        >
          {saved ? '✓ Changes Applied' : 'Apply Configuration'}
        </button>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          Delete node
        </button>
      </div>
    </aside>
  )
}
