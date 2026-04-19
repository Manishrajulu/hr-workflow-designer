import { useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useWorkflowStore } from './store/workflowStore'
import { NODE_TYPE_CONFIG } from './types/workflow'
import type { NodeType } from './types/workflow'

import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from './components/nodes'
import { NodePalette } from './components/panels/NodePalette'
import { ConfigPanel } from './components/panels/ConfigPanel'
import { SimulationPanel } from './components/panels/SimulationPanel'
import { TopBar } from './components/panels/TopBar'
import { useWorkflow } from './hooks/useWorkflow'
import { getAutomationById } from './api/mockApi'

// Defined OUTSIDE component — React Flow requires a stable reference
const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
}

const FlowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, loadTemplate, setWorkflowName } = useWorkflowStore()
  const { onDragStart, onDragOver, onDrop, onNodeClick, onPaneClick } = useWorkflow()
  const { fitView } = useReactFlow()

  useEffect(() => {
    getAutomationById('wf-onboarding').then(automation => {
      if (automation) {
        loadTemplate(automation.id, automation.nodes as never, automation.edges)
        setWorkflowName(automation.name)
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-1 overflow-hidden">
      <NodePalette onDragStart={onDragStart} />

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            animated: false,
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={node => NODE_TYPE_CONFIG[node.type as NodeType]?.iconBg ?? '#f1f5f9'}
            nodeStrokeColor={node => NODE_TYPE_CONFIG[node.type as NodeType]?.borderColor ?? '#e2e8f0'}
            maskColor="rgba(248,250,252,0.75)"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>

      <ConfigPanel />
    </div>
  )
}

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      <TopBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <FlowCanvas />
        <SimulationPanel />
      </div>
    </div>
  )
}
