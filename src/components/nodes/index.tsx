import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import type { NodeData } from '../../types/workflow'
import { BaseNode } from './BaseNode'

// ─── Icons ───────────────────────────────────────────────────────────────────

const StartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5.5" fill="#16a34a" />
    <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="white" />
  </svg>
)

const TaskIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" fill="#1d4ed8" />
    <path d="M5 7h6M5 9.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const ApprovalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 2l2 4h4l-3 2.5 1 4L8 10l-4 2.5 1-4L2 6h4z" fill="#c2410c" />
  </svg>
)

const AutomatedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5.5" stroke="#7c3aed" strokeWidth="1.4" />
    <path d="M8 4.5v3.5l2.5 1.2" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const EndIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5.5" fill="#be185d" />
    <rect x="5.5" y="5.5" width="5" height="5" rx="1" fill="white" />
  </svg>
)

// ─── Node Components ──────────────────────────────────────────────────────────

export const StartNode = memo((props: NodeProps<NodeData>) => (
  <BaseNode {...props} nodeType="start" icon={<StartIcon />} showTarget={false} />
))

export const TaskNode = memo((props: NodeProps<NodeData>) => (
  <BaseNode {...props} nodeType="task" icon={<TaskIcon />} />
))

export const ApprovalNode = memo((props: NodeProps<NodeData>) => (
  <BaseNode {...props} nodeType="approval" icon={<ApprovalIcon />} />
))

export const AutomatedNode = memo((props: NodeProps<NodeData>) => (
  <BaseNode {...props} nodeType="automated" icon={<AutomatedIcon />} />
))

export const EndNode = memo((props: NodeProps<NodeData>) => (
  <BaseNode {...props} nodeType="end" icon={<EndIcon />} showSource={false} />
))

StartNode.displayName = 'StartNode'
TaskNode.displayName = 'TaskNode'
ApprovalNode.displayName = 'ApprovalNode'
AutomatedNode.displayName = 'AutomatedNode'
EndNode.displayName = 'EndNode'
