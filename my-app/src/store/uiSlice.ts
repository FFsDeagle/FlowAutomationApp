import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { NodeType } from '../workflow-engine-core'

interface UIState {
  currentView: 'dashboard' | 'workflow-builder'
  selectedNodeId: string | null
  isDragging: boolean
  dragNodeType: NodeType | null
  isConnecting: boolean
  connectionStart: { nodeId: string; output: string } | null
  sidebarOpen: boolean
  rightPanelOpen: boolean
  zoomLevel: number
  panOffset: { x: number; y: number }
}

const initialState: UIState = {
  currentView: 'dashboard',
  selectedNodeId: null,
  isDragging: false,
  dragNodeType: null,
  isConnecting: false,
  connectionStart: null,
  sidebarOpen: true,
  rightPanelOpen: false,
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<'dashboard' | 'workflow-builder'>) => {
      state.currentView = action.payload
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload
      state.rightPanelOpen = action.payload !== null
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload
    },
    setDragNodeType: (state, action: PayloadAction<NodeType | null>) => {
      state.dragNodeType = action.payload
    },
    setIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload
      if (!action.payload) {
        state.connectionStart = null
      }
    },
    setConnectionStart: (state, action: PayloadAction<{ nodeId: string; output: string } | null>) => {
      state.connectionStart = action.payload
      state.isConnecting = action.payload !== null
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleRightPanel: (state) => {
      state.rightPanelOpen = !state.rightPanelOpen
    },
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = Math.max(0.1, Math.min(3, action.payload))
    },
    setPanOffset: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.panOffset = action.payload
    },
    resetWorkspaceView: (state) => {
      state.zoomLevel = 1
      state.panOffset = { x: 0, y: 0 }
    },
  },
})

export const {
  setCurrentView,
  setSelectedNodeId,
  setIsDragging,
  setDragNodeType,
  setIsConnecting,
  setConnectionStart,
  toggleSidebar,
  toggleRightPanel,
  setZoomLevel,
  setPanOffset,
  resetWorkspaceView,
} = uiSlice.actions

export default uiSlice.reducer
