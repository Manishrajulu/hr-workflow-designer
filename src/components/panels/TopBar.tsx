import { useState } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'

export const TopBar = () => {
  const { workflowName, setWorkflowName, exportJSON, importJSON, nodes, validation } = useWorkflowStore()
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(workflowName)
  const [saved, setSaved] = useState(false)

  const isValid = validation.isValid

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        const text = ev.target?.result as string
        importJSON(text)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const commitName = () => {
    setWorkflowName(nameVal.trim() || 'Untitled Workflow')
    setEditingName(false)
  }

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-white border-b border-slate-200 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
            <rect x="1" y="1" width="6" height="6" rx="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" />
            <path d="M12 9v6M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-slate-700">Workflow Designer</span>
          <span className="text-slate-300 mx-1">/</span>

          {editingName ? (
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => e.key === 'Enter' && commitName()}
              className="text-sm text-slate-600 border-b border-indigo-400 outline-none bg-transparent w-44"
            />
          ) : (
            <button
              onClick={() => { setEditingName(true); setNameVal(workflowName) }}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {workflowName}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''}
          </span>
          
          {isValid ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              READY
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold animate-pulse">
              <div className="w-1 h-1 rounded-full bg-red-500" />
              ERRORS
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all duration-150"
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 11V2M4 7l4 4 4-4M2 13h12" />
          </svg>
          Import
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all duration-150"
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 2v9M4 8l4-4 4 4M2 13h12" />
          </svg>
          Export JSON
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            saved
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {saved ? (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8l4 4 6-6" />
              </svg>
              Saved
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="white">
                <path d="M3 2h8l3 3v9H2V2zm4 8a2 2 0 100-4 2 2 0 000 4zm3-8H6v3h4V2z" />
              </svg>
              Save
            </>
          )}
        </button>
      </div>
    </header>
  )
}
