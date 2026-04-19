import type { Automation, SimulationResult, NodeType, ActionSchema, WorkflowNode } from '../types/workflow'
import type { Edge } from 'reactflow'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const actionSchemas: ActionSchema[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Sends a notification email to a specified recipient',
    params: [
      { name: 'recipient', label: 'Recipient Email', type: 'text', placeholder: 'e.g. employee@company.com', required: true },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Welcome to the team!' },
      { name: 'body', label: 'Message Body', type: 'textarea', placeholder: 'Write your message here...' }
    ]
  },
  {
    id: 'provision_accounts',
    label: 'Provision Accounts',
    description: 'Automatically creates IT accounts in target systems',
    params: [
      { name: 'systems', label: 'Target Systems', type: 'select', options: ['G-Suite', 'Slack', 'GitHub', 'AWS'], placeholder: 'Select system' },
      { name: 'accessLevel', label: 'Access Level', type: 'select', options: ['Standard', 'Admin', 'ReadOnly'] }
    ]
  },
  {
    id: 'update_record',
    label: 'Update HR Record',
    description: 'Updates a field in the employee database',
    params: [
      { name: 'field', label: 'Field Name', type: 'text', placeholder: 'e.g. employment_status' },
      { name: 'value', label: 'New Value', type: 'text', placeholder: 'e.g. Active' }
    ]
  },
  {
    id: 'webhook',
    label: 'Trigger Webhook',
    description: 'Sends a POST request to an external service',
    params: [
      { name: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://api.external.com/hook' },
      { name: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'PATCH'] }
    ]
  }
]

const makeNode = (id: string, type: NodeType, x: number, y: number, label: string, extra: Record<string, any> = {}) => ({
  id,
  type,
  position: { x, y },
  data: {
    label,
    description: '',
    assignee: type === 'start' || type === 'automated' || type === 'end' ? 'System' : 'HR Admin',
    dueDate: '',
    approverRole: 'Line Manager',
    threshold: 1,
    actionType: type === 'automated' ? 'send_email' : '',
    actionParams: {},
    status: 'idle' as const,
    meta: label,
    endMessage: '',
    summaryFlag: false,
    customFields: [],
    ...extra,
  },
})

const makeEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#94a3b8', strokeWidth: 1.5 },
})

const mockAutomations: Automation[] = [
  {
    id: 'wf-onboarding',
    name: 'Employee Onboarding',
    description: 'Full onboarding flow from hire date to account provisioning',
    createdAt: '2025-01-15T10:00:00Z',
    nodes: [
      makeNode('n1', 'start',     40,  60, 'Hire Date Trigger',   { assignee: 'System',     meta: 'Triggered on hire date' }),
      makeNode('n2', 'task',     260,  40, 'Send Welcome Email',  { assignee: 'HR Admin',   meta: 'Assigned to HR Admin' }),
      makeNode('n3', 'approval', 480,  60, 'Manager Sign-off',    { assignee: 'Manager',    meta: 'Approver: Line Manager', approverRole: 'Line Manager', threshold: 1 }),
      makeNode('n4', 'automated',340, 200, 'Provision Accounts',  { assignee: 'System',     meta: 'Creates IT accounts', actionType: 'provision_accounts' }),
      makeNode('n5', 'task',     560, 200, 'IT Equipment Setup',  { assignee: 'IT Support', meta: 'Assigned to IT Support', dueDate: '2025-06-10' }),
      makeNode('n6', 'end',      720, 130, 'Onboarding Complete', { assignee: '—',          meta: 'Terminal state' }),
    ],
    edges: [
      makeEdge('e1-2', 'n1', 'n2'),
      makeEdge('e2-3', 'n2', 'n3'),
      makeEdge('e3-4', 'n3', 'n4'),
      makeEdge('e4-5', 'n4', 'n5'),
      makeEdge('e5-6', 'n5', 'n6'),
    ],
  },
  {
    id: 'wf-offboarding',
    name: 'Employee Offboarding',
    description: 'Comprehensive exit process including asset recovery and access revocation',
    createdAt: '2025-04-10T11:00:00Z',
    nodes: [
      makeNode('off1', 'start',     40, 100, 'Termination Notice'),
      makeNode('off2', 'task',      240,  60, 'HR Exit Paperwork', { assignee: 'HR Admin' }),
      makeNode('off3', 'approval',  460, 100, 'Manager Approval', { assignee: 'Department Head' }),
      makeNode('off4', 'automated', 360, 220, 'Revoke Cloud Access', { actionType: 'provision_accounts', actionParams: { accessLevel: 'ReadOnly' } }),
      makeNode('off5', 'task',      580, 220, 'Asset Collection', { assignee: 'IT Support', description: 'Collect laptop and badge' }),
      makeNode('off6', 'end',       760, 150, 'Offboarding Closed'),
    ],
    edges: [
      makeEdge('offe1', 'off1', 'off2'),
      makeEdge('offe2', 'off2', 'off3'),
      makeEdge('offe3', 'off3', 'off4'),
      makeEdge('offe4', 'off4', 'off5'),
      makeEdge('offe5', 'off5', 'off6'),
    ],
  },
  {
    id: 'wf-perf-review',
    name: 'Annual Performance Review',
    description: 'Standard multi-stage review cycle with HR compliance check',
    createdAt: '2025-05-01T08:30:00Z',
    nodes: [
      makeNode('pr1', 'start',     60, 120, 'Review Cycle Start'),
      makeNode('pr2', 'task',      260, 120, 'Self Assessment', { assignee: 'Employee' }),
      makeNode('pr3', 'approval',  460,  60, 'Manager Evaluation', { approverRole: 'Line Manager' }),
      makeNode('pr4', 'approval',  660, 120, 'HR Compliance', { approverRole: 'HR Director' }),
      makeNode('pr5', 'automated', 560, 240, 'Update Payroll Grade', { actionType: 'update_record' }),
      makeNode('pr6', 'end',       760, 240, 'Review Finalized'),
    ],
    edges: [
      makeEdge('pre1', 'pr1', 'pr2'),
      makeEdge('pre2', 'pr2', 'pr3'),
      makeEdge('pre3', 'pr3', 'pr4'),
      makeEdge('pre4', 'pr4', 'pr5'),
      makeEdge('pre5', 'pr5', 'pr6'),
    ],
  },
]

export interface AutomationAction {
  id: string
  label: string
  params: string[]
}

const mockAutomationActions: AutomationAction[] = [
  { id: 'send_email',    label: 'Send Email',         params: ['to', 'subject', 'body'] },
  { id: 'generate_doc',  label: 'Generate Document',  params: ['template', 'recipient'] },
  { id: 'update_record', label: 'Update HR Record',   params: ['field', 'value'] },
  { id: 'webhook',       label: 'Trigger Webhook',    params: ['url', 'method'] },
  { id: 'slack_notify',  label: 'Slack Notification', params: ['channel', 'message'] },
]

// GET /automations
export const getAutomations = async (): Promise<AutomationAction[]> => {
  await delay(300)
  return mockAutomationActions
}

// GET /workflow-templates
export const getWorkflowTemplates = async (): Promise<Automation[]> => {
  await delay(400)
  return mockAutomations
}

// GET /automations/:id
export const getAutomationById = async (id: string): Promise<Automation | null> => {
  await delay(200)
  return mockAutomations.find(a => a.id === id) ?? null
}

// GET /action-schemas
export const getActionSchemas = async (): Promise<ActionSchema[]> => {
  await delay(300)
  return actionSchemas
}

// POST /simulate
export const simulate = async (workflowId: string, orderedNodes: WorkflowNode[]): Promise<SimulationResult> => {
  await delay(500)
  
  const steps = orderedNodes.map(node => {
    // Basic business logic simulation
    const isEnd = node.type === 'end'
    return {
      nodeId: node.id,
      nodeLabel: node.data.label,
      nodeType: node.type,
      status: 'success' as const,
      message: isEnd 
        ? `Workflow successfully terminated at "${node.data.label}"`
        : `"${node.data.label}" completed successfully`,
      duration: Math.floor(Math.random() * 400) + 100,
    }
  })

  return {
    workflowId,
    status: 'success',
    steps,
    totalDuration: steps.reduce((acc, s) => acc + s.duration, 0),
  }
}
