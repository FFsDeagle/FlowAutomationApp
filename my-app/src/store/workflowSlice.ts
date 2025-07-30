import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Workflow, NodeConfig, NodeConnection, WorkflowExecution } from '../workflow-engine-core'

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  executions: WorkflowExecution[]
  isLoading: boolean
  error: string | null
}

const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  executions: [],
  isLoading: false,
  error: null,
}

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setWorkflows: (state, action: PayloadAction<Workflow[]>) => {
      state.workflows = action.payload
    },
    addWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflows.push(action.payload)
    },
    updateWorkflow: (state, action: PayloadAction<Workflow>) => {
      const index = state.workflows.findIndex(w => w.id === action.payload.id)
      if (index !== -1) {
        state.workflows[index] = action.payload
      }
      if (state.currentWorkflow?.id === action.payload.id) {
        state.currentWorkflow = action.payload
      }
    },
    deleteWorkflow: (state, action: PayloadAction<string>) => {
      state.workflows = state.workflows.filter(w => w.id !== action.payload)
      if (state.currentWorkflow?.id === action.payload) {
        state.currentWorkflow = null
      }
    },
    setCurrentWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.currentWorkflow = action.payload
    },
    addNodeToCurrentWorkflow: (state, action: PayloadAction<NodeConfig>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.nodes.push(action.payload)
        state.currentWorkflow.updatedAt = new Date()
      }
    },
    updateNodeInCurrentWorkflow: (state, action: PayloadAction<NodeConfig>) => {
      if (state.currentWorkflow) {
        const index = state.currentWorkflow.nodes.findIndex(n => n.id === action.payload.id)
        if (index !== -1) {
          state.currentWorkflow.nodes[index] = action.payload
          state.currentWorkflow.updatedAt = new Date()
        }
      }
    },
    deleteNodeFromCurrentWorkflow: (state, action: PayloadAction<string>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.nodes = state.currentWorkflow.nodes.filter(n => n.id !== action.payload)
        // Remove connections involving this node
        state.currentWorkflow.connections = state.currentWorkflow.connections.filter(
          c => c.sourceNodeId !== action.payload && c.targetNodeId !== action.payload
        )
        state.currentWorkflow.updatedAt = new Date()
      }
    },
    addConnectionToCurrentWorkflow: (state, action: PayloadAction<NodeConnection>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.connections.push(action.payload)
        state.currentWorkflow.updatedAt = new Date()
      }
    },
    deleteConnectionFromCurrentWorkflow: (state, action: PayloadAction<string>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.connections = state.currentWorkflow.connections.filter(
          c => c.id !== action.payload
        )
        state.currentWorkflow.updatedAt = new Date()
      }
    },
    updateNodePosition: (state, action: PayloadAction<{ nodeId: string; position: { x: number; y: number } }>) => {
      if (state.currentWorkflow) {
        const node = state.currentWorkflow.nodes.find(n => n.id === action.payload.nodeId)
        if (node) {
          node.position = action.payload.position
          state.currentWorkflow.updatedAt = new Date()
        }
      }
    },
    addExecution: (state, action: PayloadAction<WorkflowExecution>) => {
      state.executions.push(action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setWorkflows,
  addWorkflow,
  updateWorkflow,
  deleteWorkflow,
  setCurrentWorkflow,
  addNodeToCurrentWorkflow,
  updateNodeInCurrentWorkflow,
  deleteNodeFromCurrentWorkflow,
  addConnectionToCurrentWorkflow,
  deleteConnectionFromCurrentWorkflow,
  updateNodePosition,
  addExecution,
  setLoading,
  setError,
} = workflowSlice.actions

export default workflowSlice.reducer
