import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import type { NodeConfig } from '../workflow-engine-core'
import './WorkflowNode.css'

interface WorkflowNodeProps {
  node: NodeConfig
  onClick: (nodeId: string) => void
  onDrag: (nodeId: string, position: { x: number; y: number }) => void
  onConnectionStart: (nodeId: string, output: string) => void
  onConnectionEnd: (nodeId: string, input: string) => void
}

const getNodeIcon = (type: string): string => {
  const icons = {
    trigger: '⚡',
    action: '🔧',
    table: '🗄️',
    page: '📄',
    email: '✉️',
    notification: '🔔',
    invoice: '🧾',
    report: '📊',
  }
  return icons[type as keyof typeof icons] || '❓'
}

const getNodeColor = (type: string): string => {
  const colors = {
    trigger: '#10b981',
    action: '#3b82f6',
    table: '#8b5cf6',
    page: '#06b6d4',
    email: '#ef4444',
    notification: '#f59e0b',
    invoice: '#84cc16',
    report: '#ec4899',
  }
  return colors[type as keyof typeof colors] || '#6b7280'
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  onClick,
  onDrag,
  onConnectionStart,
  onConnectionEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)
  
  const selectedNodeId = useSelector((state: RootState) => state.ui.selectedNodeId)
  const isConnecting = useSelector((state: RootState) => state.ui.isConnecting)
  
  const isSelected = selectedNodeId === node.id

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const rect = nodeRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!nodeRef.current?.parentElement) return
      
      const parentRect = nodeRef.current.parentElement.getBoundingClientRect()
      const newPosition = {
        x: e.clientX - parentRect.left - dragOffset.x,
        y: e.clientY - parentRect.top - dragOffset.y,
      }
      
      onDrag(node.id, newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick(node.id)
  }

  const handleOutputClick = (e: React.MouseEvent, output: string) => {
    e.stopPropagation()
    onConnectionStart(node.id, output)
  }

  const handleInputClick = (e: React.MouseEvent, input: string) => {
    e.stopPropagation()
    if (isConnecting) {
      onConnectionEnd(node.id, input)
    }
  }

  return (
    <div
      ref={nodeRef}
      className={`workflow-node ${node.type} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        '--node-color': getNodeColor(node.type),
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Node inputs */}
      <div className="node-inputs">
        {node.type !== 'trigger' && (
          <div
            className="node-input"
            onClick={(e) => handleInputClick(e, 'input')}
            title="Input"
          >
            <div className="connection-point input" />
          </div>
        )}
      </div>

      {/* Node content */}
      <div className="node-content">
        <div className="node-header">
          <span className="node-icon">{getNodeIcon(node.type)}</span>
          <span className="node-title">{node.name}</span>
          {!node.enabled && <span className="disabled-indicator">⏸️</span>}
        </div>
        
        <div className="node-type">{node.type}</div>
        
        {node.description && (
          <div className="node-description">{node.description}</div>
        )}
      </div>

      {/* Node outputs */}
      <div className="node-outputs">
        <div
          className="node-output"
          onClick={(e) => handleOutputClick(e, 'output')}
          title="Output"
        >
          <div className="connection-point output" />
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && <div className="selection-indicator" />}
    </div>
  )
}

export default WorkflowNode
