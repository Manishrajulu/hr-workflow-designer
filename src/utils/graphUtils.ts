import type { Edge } from 'reactflow'
import type { WorkflowNode, ValidationResult } from '../types/workflow'

/**
 * Validates the workflow based on strict graph rules.
 */
export const validateWorkflow = (nodes: WorkflowNode[], edges: Edge[]): ValidationResult => {
  const errors: string[] = []
  const invalidNodeIds: Set<string> = new Set()

  const startNodes = nodes.filter((n) => n.type === 'start')
  const endNodes = nodes.filter((n) => n.type === 'end')

  // 1. Cardinality check
  if (startNodes.length === 0) {
    errors.push('Workflow must have exactly one Start node.')
  } else if (startNodes.length > 1) {
    errors.push('Workflow cannot have multiple Start nodes.')
    startNodes.forEach((n) => invalidNodeIds.add(n.id))
  }

  if (endNodes.length === 0) {
    errors.push('Workflow must have at least one End node.')
  }

  // 2. Start node constraint: No incoming edges
  const startNode = startNodes[0]
  if (startNode) {
    const incomingToStart = edges.some((e) => e.target === startNode.id)
    if (incomingToStart) {
      errors.push('Start node cannot have incoming edges.')
      invalidNodeIds.add(startNode.id)
    }
  }

  // 3. Dangling edges & Connectivity
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = new Map<string, string[]>()
  const revAdj = new Map<string, string[]>()

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      errors.push(`Broken connection detected: ${edge.id}`)
      continue
    }
    if (!adj.has(edge.source)) adj.set(edge.source, [])
    adj.get(edge.source)!.push(edge.target)

    if (!revAdj.has(edge.target)) revAdj.set(edge.target, [])
    revAdj.get(edge.target)!.push(edge.source)
  }

  // BFS Reachability from Start
  if (startNode) {
    const reachable = new Set<string>()
    const queue = [startNode.id]
    reachable.add(startNode.id)

    while (queue.length > 0) {
      const curr = queue.shift()!
      const neighbors = adj.get(curr) || []
      for (const next of neighbors) {
        if (!reachable.has(next)) {
          reachable.add(next)
          queue.push(next)
        }
      }
    }

    // Nodes not reachable from Start
    nodes.forEach((node) => {
      if (!reachable.has(node.id)) {
        errors.push(`Node "${node.data.label}" is unreachable from Start.`)
        invalidNodeIds.add(node.id)
      }
    })
  } else if (nodes.length > 0) {
    // If no start node but nodes exist, they are technically all unreachable/disconnected component
    nodes.forEach(n => invalidNodeIds.add(n.id))
  }

  // 4. Cycle Detection (DFS)
  const visited = new Set<string>()
  const recStack = new Set<string>()
  let hasCycle = false

  const detectCycle = (u: string) => {
    visited.add(u)
    recStack.add(u)

    const neighbors = adj.get(u) || []
    for (const v of neighbors) {
      if (!visited.has(v)) {
        if (detectCycle(v)) return true
      } else if (recStack.has(v)) {
        hasCycle = true
        return true
      }
    }

    recStack.delete(u)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (detectCycle(node.id)) break
    }
  }

  if (hasCycle) {
    errors.push('Infinite loop detected in workflow.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    invalidNodeIds: Array.from(invalidNodeIds),
  }
}

/**
 * Returns nodes in BFS execution order starting from the Start node.
 */
export const getExecutionOrder = (nodes: WorkflowNode[], edges: Edge[]): WorkflowNode[] => {
  const startNode = nodes.find((n) => n.type === 'start')
  if (!startNode) return []

  const adj = new Map<string, string[]>()
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push(e.target)
  })

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const executionOrder: WorkflowNode[] = []
  const visited = new Set<string>()
  const queue = [startNode.id]
  visited.add(startNode.id)

  while (queue.length > 0) {
    const currId = queue.shift()!
    const node = nodeMap.get(currId)
    if (node) executionOrder.push(node)

    const neighbors = adj.get(currId) || []
    for (const nextId of neighbors) {
      if (!visited.has(nextId)) {
        visited.add(nextId)
        queue.push(nextId)
      }
    }
  }

  return executionOrder
}
