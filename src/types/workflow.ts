import type { Edge, XYPosition } from 'reactflow'

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export interface ActionParam {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  options?: string[]
  placeholder?: string
  required?: boolean
}

export interface ActionSchema {
  id: string
  label: string
  description: string
  params: ActionParam[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  invalidNodeIds: string[]
}

export interface NodeData {
  label: string
  description: string
  assignee: string
  dueDate: string
  approverRole: string
  threshold: number
  actionType: string
  actionParams: Record<string, any>
  status: NodeStatus
  meta: string
  isInvalid?: boolean
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: XYPosition
  data: NodeData
}

export interface Automation {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: Edge[]
  createdAt: string
}

export interface SimulationStep {
  nodeId: string
  nodeLabel: string
  nodeType: NodeType
  status: 'success' | 'error'
  message: string
  duration: number
}

export interface SimulationResult {
  workflowId: string
  status: 'success' | 'partial' | 'error'
  steps: SimulationStep[]
  totalDuration: number
}

export const NODE_TYPE_CONFIG: Record<NodeType, {
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  iconBg: string
  tag: string
  defaultData: Partial<NodeData>
}> = {
  start: {
    label: 'Start',
    description: 'Trigger point',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    iconBg: '#dcfce7',
    tag: 'trigger',
    defaultData: { assignee: 'System', meta: 'Workflow trigger' },
  },
  task: {
    label: 'Task',
    description: 'Assign work item',
    color: '#1d4ed8',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    iconBg: '#dbeafe',
    tag: 'task',
    defaultData: { assignee: 'HR Team', meta: 'Assigned action' },
  },
  approval: {
    label: 'Approval',
    description: 'Review gate',
    color: '#c2410c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    iconBg: '#ffedd5',
    tag: 'approval',
    defaultData: { assignee: 'Manager', approverRole: 'Line Manager', threshold: 1, meta: 'Review gate' },
  },
  automated: {
    label: 'Automated',
    description: 'System action',
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    iconBg: '#ede9fe',
    tag: 'auto',
    defaultData: { assignee: 'System', actionType: 'send_email', meta: 'System action', actionParams: {} },
  },
  end: {
    label: 'End',
    description: 'Terminal state',
    color: '#be185d',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    iconBg: '#fce7f3',
    tag: 'end',
    defaultData: { assignee: '—', meta: 'Terminal state' },
  },
}
