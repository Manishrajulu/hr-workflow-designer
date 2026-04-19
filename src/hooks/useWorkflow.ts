import { useCallback, useRef } from 'react'
import { useReactFlow } from 'reactflow'
import type { DragEvent } from 'react'
import type { NodeType } from '../types/workflow'
import { useWorkflowStore } from '../store/workflowStore'

export const useWorkflow = () => {
  const { addNode, selectNode } = useWorkflowStore()
  const { screenToFlowPosition, fitView } = useReactFlow()
  const dragTypeRef = useRef<NodeType | null>(null)

  const onDragStart = useCallback((event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    dragTypeRef.current = nodeType
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/reactflow', nodeType)
  }, [])

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const type = (event.dataTransfer.getData('application/reactflow') as NodeType) || dragTypeRef.current
    if (!type) return
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    addNode(type, position)
    dragTypeRef.current = null
  }, [addNode, screenToFlowPosition])

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  const fitToView = useCallback(() => {
    fitView({ padding: 0.2, duration: 400 })
  }, [fitView])

  return { onDragStart, onDragOver, onDrop, onNodeClick, onPaneClick, fitToView }
}
