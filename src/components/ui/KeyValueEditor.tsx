import React from 'react'
import clsx from 'clsx'

interface KVPair {
  key: string
  value: string
}

interface Props {
  pairs: KVPair[]
  onChange: (pairs: KVPair[]) => void
}

export const KeyValueEditor: React.FC<Props> = ({ pairs, onChange }) => {
  const handleAdd = () => {
    onChange([...pairs, { key: '', value: '' }])
  }

  const handleRemove = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index))
  }

  const updatePair = (index: number, field: keyof KVPair, value: string) => {
    const newPairs = [...pairs]
    newPairs[index] = { ...newPairs[index], [field]: value }
    onChange(newPairs)
  }

  const inputCls = clsx(
    'px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 outline-none transition-all duration-150',
    'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
  )

  return (
    <div className="flex flex-col gap-2">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className={clsx(inputCls, 'flex-1')}
            placeholder="Key"
            value={pair.key}
            onChange={(e) => updatePair(index, 'key', e.target.value)}
          />
          <input
            className={clsx(inputCls, 'flex-1')}
            placeholder="Value"
            value={pair.value}
            onChange={(e) => updatePair(index, 'value', e.target.value)}
          />
          <button
            onClick={() => handleRemove(index)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center pt-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className={clsx(
          'flex items-center justify-center gap-1.5 w-full py-1.5 border-2 border-dashed border-indigo-200 rounded-lg text-[11px] font-medium text-indigo-500',
          'hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-[0.98]'
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add field
      </button>
    </div>
  )
}
