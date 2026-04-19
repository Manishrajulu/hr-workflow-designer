# HR Workflow Designer

A production-grade, schema-driven workflow orchestration module built with React, React Flow, and Zustand. This application allows HR administrators to design, validate, and simulate complex operational workflows with real-time feedback and graph-based execution.

## 🚀 Features

- **Advanced Graph Canvas**: Drag-and-drop node creation, interactive connections, and a mini-map for navigation.
- **Strict Validation Engine**: Real-time graph analysis ensuring exactly one Start node, reachability from terminal points, and cycle detection.
- **Graph-Based Simulation**: Deterministic execution simulation using BFS traversal starting from the trigger point.
- **Schema-Driven Automation**: Dynamic configuration forms for automated steps, powered by a flexible metadata service.
- **Persistence**: Export and Import workflows as JSON for portability and storage.
- **Professional UX**: Premium aesthetics with status indicators, responsive panels, and smooth animations.

## 🛠 Tech Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Vanilla CSS for custom animations)
- **Flow Engine**: React Flow
- **State Management**: Zustand
- **Utility**: Nanoid (ID generation)
- **Language**: TypeScript (Strict mode)

## 🏗 Architecture & Design

### State Management (Zustand)
The application follows a unidirectional data flow pattern. The `workflowStore` serves as the single source of truth for nodes, edges, selection state, and validation status. Every mutation to the canvas (moving, connecting, deleting) triggers a debounced validation cycle.

### Graph Execution Logic
Unlike simple UI-order heuristics, this system treats the workflow as a true Directed Acyclic Graph (DAG) during simulation:
1. **Traversal**: A BFS (Breadth-First Search) algorithm identifies the order of execution starting from the `start` node.
2. **Cycle Prevention**: The execution engine uses a `visited` set to detect and safely exit from unintentional loops.
3. **Simulation**: Execution is simulated step-by-step with status updates (`idle` → `running` → `success`) visible on the canvas.

### Validation Strategy
The `validateWorkflow` utility enforces production constraints:
- **Topology**: Checks for disconnected subgraphs and unreachable nodes.
- **Constraints**: Ensures the `start` node has no incoming edges and at least one `end` node exists.
- **Integrity**: Flags dangling edges and missing node references.
- **Visual Feedback**: Errors are mapped back to specific `nodeIds`, allowing the UI to highlight invalid components with high precision.

### Extensible Forms
Automation nodes are refactored to be schema-driven. Adding a new automation action (e.g., "Slack Notification") only requires:
1. Adding a schema to the `getActionSchemas` API response.
2. The `ConfigPanel` will automatically render the appropriate inputs (text, select, textarea) based on the metadata.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🧠 Trade-offs & Assumptions

- **Cycle Handling**: For this version, cyclic graphs are marked as "Invalid" to enforce deterministic HR flows. In future iterations, loops could be supported with explicit "Maximum Iteration" configs.
- **Mock Persistence**: State is maintained in-memory and lost on refresh. JSON Export/Import is the primary way to persist designs for now.
- **Simulation Time**: Artificial delays are added to simulation steps to improve visual tracking of the execution flow.
