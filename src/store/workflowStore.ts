import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow'
import type { Edge, OnNodesChange, OnEdgesChange, OnConnect, XYPosition } from 'reactflow'
import { nanoid } from 'nanoid'
import type { WorkflowNode, NodeType, NodeData, SimulationResult, SimulationStep, ValidationResult } from '../types/workflow'
import { NODE_TYPE_CONFIG } from '../types/workflow'
import { simulate as apiSimulate } from '../api/mockApi'
import { validateWorkflow, getExecutionOrder } from '../utils/graphUtils'

interface WorkflowState {
  // Workflow metadata
  workflowId: string
  workflowName: string

  // React Flow state
  nodes: WorkflowNode[]
  edges: Edge[]
  validation: ValidationResult

  // UI state
  selectedNodeId: string | null
  isSimulating: boolean
  simulationResult: SimulationResult | null
  simulationSteps: SimulationStep[]
  isLoadingTemplate: boolean

  // React Flow handlers
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  // Actions
  validate: () => void
  addNode: (type: NodeType, position: XYPosition) => void
  updateNodeData: (id: string, data: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => void
  selectNode: (id: string | null) => void

  // Workflow actions
  setWorkflowName: (name: string) => void
  loadTemplate: (automationId: string, nodes: WorkflowNode[], edges: Edge[]) => void
  clearCanvas: () => void
  exportJSON: () => string
  importJSON: (json: string) => void

  // Simulation
  runSimulation: () => Promise<void>
  clearSimulation: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: 'wf-default',
  workflowName: 'Employee Onboarding',
  nodes: [],
  edges: [],
  validation: { isValid: true, errors: [], invalidNodeIds: [] },
  selectedNodeId: null,
  isSimulating: false,
  simulationResult: null,
  simulationSteps: [],
  isLoadingTemplate: false,

  validate: () => {
    const { nodes, edges } = get()
    const result = validateWorkflow(nodes, edges)
    
    // Update isInvalid flag on nodes for easier UI access
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isInvalid: result.invalidNodeIds.includes(node.id)
      }
    }))

    set({ validation: result, nodes: updatedNodes })
  },

  onNodesChange: (changes) => {
    set(state => ({
      nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
    }))
    get().validate()
  },

  onEdgesChange: (changes) => {
    set(state => ({
      edges: applyEdgeChanges(changes, state.edges),
    }))
    get().validate()
  },

  onConnect: (connection) => {
    set(state => ({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
        },
        state.edges
      ),
    }))
    get().validate()
  },

  addNode: (type, position) => {
    const config = NODE_TYPE_CONFIG[type]
    const newNode: WorkflowNode = {
      id: nanoid(8),
      type,
      position,
      data: {
        label: `${config.label} Node`,
        description: '',
        assignee: '',
        dueDate: '',
        approverRole: 'Line Manager',
        threshold: 1,
        actionType: config.defaultData.actionType ?? '',
        actionParams: {},
        status: 'idle',
        meta: config.defaultData.meta ?? '',
        ...config.defaultData,
      },
    }
    set(state => ({ nodes: [...state.nodes, newNode] }))
    get().validate()
  },

  updateNodeData: (id, data) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }))
    get().validate()
  },

  deleteNode: (id) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }))
    get().validate()
  },

  duplicateNode: (id) => {
    const node = get().nodes.find(n => n.id === id)
    if (!node) return
    const newNode: WorkflowNode = {
      ...node,
      id: nanoid(8),
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      data: { ...node.data, label: `${node.data.label} (copy)` },
    }
    set(state => ({ nodes: [...state.nodes, newNode] }))
    get().validate()
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  setWorkflowName: (name) => set({ workflowName: name }),

  loadTemplate: (automationId, nodes, edges) => {
    set({
      workflowId: automationId,
      nodes,
      edges,
      selectedNodeId: null,
      simulationResult: null,
      simulationSteps: [],
    })
    get().validate()
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, simulationResult: null, simulationSteps: [] })
    get().validate()
  },

  exportJSON: () => {
    const { nodes, edges, workflowName } = get()
    return JSON.stringify({ workflowName, nodes, edges }, null, 2)
  },

  importJSON: (json) => {
    try {
      const parsed = JSON.parse(json)
      if (parsed.nodes && parsed.edges) {
        set({
          nodes: parsed.nodes,
          edges: parsed.edges,
          workflowName: parsed.workflowName ?? 'Imported Workflow',
          selectedNodeId: null,
          simulationResult: null,
          simulationSteps: [],
        })
        get().validate()
      }
    } catch {
      console.error('Invalid JSON')
    }
  },

  runSimulation: async () => {
    const { nodes, edges, workflowId, validation } = get()
    if (!validation.isValid || nodes.length === 0) return

    set({ isSimulating: true, simulationResult: null, simulationSteps: [] })

    // Reset statuses
    set(state => ({
      nodes: state.nodes.map(n => ({ ...n, data: { ...n.data, status: 'idle' as const } })),
    }))

    // Get proper execution order via graph traversal
    const orderedNodes = getExecutionOrder(nodes, edges)

    for (const node of orderedNodes) {
      // Mark current node as running
      set(state => ({
        nodes: state.nodes.map(n =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'running' as const } } : n
        ),
      }))

      await new Promise(r => setTimeout(r, 600))

      // Mark as success
      set(state => ({
        nodes: state.nodes.map(n =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'success' as const } } : n
        ),
      }))

      const step: SimulationStep = {
        nodeId: node.id,
        nodeLabel: node.data.label,
        nodeType: node.type,
        status: 'success',
        message: `"${node.data.label}" completed successfully`,
        duration: Math.floor(Math.random() * 400) + 100,
      }
      set(state => ({ simulationSteps: [...state.simulationSteps, step] }))
    }

    const result = await apiSimulate(workflowId, orderedNodes)
    set({ isSimulating: false, simulationResult: result })

    setTimeout(() => {
      set(state => ({
        nodes: state.nodes.map(n => ({ ...n, data: { ...n.data, status: 'idle' as const } })),
      }))
    }, 4000)
  },

  clearSimulation: () => {
    set({ simulationResult: null, simulationSteps: [] })
    set(state => ({
      nodes: state.nodes.map(n => ({ ...n, data: { ...n.data, status: 'idle' as const } })),
    }))
  },
}))
