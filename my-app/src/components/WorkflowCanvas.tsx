import { useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { 
  addNodeToCurrentWorkflow, 
  updateNodePosition,
  addConnectionToCurrentWorkflow 
} from '../store/workflowSlice'
import { 
  setIsDragging, 
  setDragNodeType, 
  setSelectedNodeId,
  setConnectionStart,
  setIsConnecting
} from '../store/uiSlice'
import WorkflowNode from './WorkflowNode'
import type { NodeConfig, NodeType, NodeConnection } from '../workflow-engine-core'
import './WorkflowCanvas.css'

const WorkflowCanvas = () => {
  const dispatch = useDispatch()
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const currentWorkflow = useSelector((state: RootState) => state.workflow.currentWorkflow)
  const { isDragging, dragNodeType, isConnecting, connectionStart } = useSelector((state: RootState) => state.ui)

  const createNodeConfig = (type: NodeType, position: { x: number; y: number }): NodeConfig => {
    const baseConfig = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      description: '',
      position,
      enabled: true,
    }

    switch (type) {
      case 'trigger':
        return {
          ...baseConfig,
          type: 'trigger',
          triggerType: 'manual',
        }
      case 'action':
        return {
          ...baseConfig,
          type: 'action',
          method: 'GET',
        }
      case 'table':
        return {
          ...baseConfig,
          type: 'table',
          tableName: 'new_table',
          operation: 'create',
        }
      case 'page':
        return {
          ...baseConfig,
          type: 'page',
          pageTitle: 'New Page',
          template: '<div>{{data}}</div>',
          dataSources: [],
          routePath: '/new-page',
        }
      case 'email':
        return {
          ...baseConfig,
          type: 'email',
          recipients: [],
          subject: 'New Email',
          template: 'Hello {{name}}',
        }
      case 'notification':
        return {
          ...baseConfig,
          type: 'notification',
          notificationType: 'push',
          recipients: [],
          message: 'New notification',
        }
      case 'invoice':
        return {
          ...baseConfig,
          type: 'invoice',
          invoiceTemplate: 'default',
          customerData: {},
          lineItems: [],
        }
      case 'report':
        return {
          ...baseConfig,
          type: 'report',
          reportType: 'pdf',
          template: 'default',
          dataSource: '',
        }
      default:
        throw new Error(`Unknown node type: ${type}`)
    }
  }

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    
    if (!dragNodeType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    const newNode = createNodeConfig(dragNodeType, position)
    dispatch(addNodeToCurrentWorkflow(newNode))
    dispatch(setIsDragging(false))
    dispatch(setDragNodeType(null))
  }, [dragNodeType, dispatch])

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on nodes
    if (e.target === canvasRef.current) {
      dispatch(setSelectedNodeId(null))
      dispatch(setConnectionStart(null))
      dispatch(setIsConnecting(false))
    }
  }, [dispatch])

  const handleNodeClick = useCallback((nodeId: string) => {
    dispatch(setSelectedNodeId(nodeId))
  }, [dispatch])

  const handleNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {
    dispatch(updateNodePosition({ nodeId, position }))
  }, [dispatch])

  const handleConnectionStart = useCallback((nodeId: string, output: string) => {
    dispatch(setConnectionStart({ nodeId, output }))
  }, [dispatch])

  const handleConnectionEnd = useCallback((targetNodeId: string, targetInput: string) => {
    if (!connectionStart) return

    const connection: NodeConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId: connectionStart.nodeId,
      targetNodeId,
      sourceOutput: connectionStart.output,
      targetInput,
    }

    dispatch(addConnectionToCurrentWorkflow(connection))
    dispatch(setConnectionStart(null))
    dispatch(setIsConnecting(false))
  }, [connectionStart, dispatch])

  if (!currentWorkflow) return null

  return (
    <div 
      ref={canvasRef}
      className={`workflow-canvas ${isDragging ? 'dragging' : ''} ${isConnecting ? 'connecting' : ''}`}
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
      onClick={handleCanvasClick}
    >
      <div className="canvas-grid" />
      
      {/* Render connections */}
      <svg className="connections-layer">
        {currentWorkflow.connections.map(connection => {
          const sourceNode = currentWorkflow.nodes.find(n => n.id === connection.sourceNodeId)
          const targetNode = currentWorkflow.nodes.find(n => n.id === connection.targetNodeId)
          
          if (!sourceNode || !targetNode) return null

          const sourceX = sourceNode.position.x + 100 // Half node width
          const sourceY = sourceNode.position.y + 50  // Half node height
          const targetX = targetNode.position.x + 100
          const targetY = targetNode.position.y + 50

          return (
            <g key={connection.id}>
              <path
                d={`M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY} ${targetX - 50} ${targetY} ${targetX} ${targetY}`}
                stroke="#6b7280"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          )
        })}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
      </svg>
      
      {/* Render nodes */}
      {currentWorkflow.nodes.map(node => (
        <WorkflowNode
          key={node.id}
          node={node}
          onClick={handleNodeClick}
          onDrag={handleNodeDrag}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
        />
      ))}
      
      {/* Drop zone indicator */}
      {isDragging && (
        <div className="drop-zone-indicator">
          Drop node here to add it to the workflow
        </div>
      )}
    </div>
  )
}

export default WorkflowCanvas
