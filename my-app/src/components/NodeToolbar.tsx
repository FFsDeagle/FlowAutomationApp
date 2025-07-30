import { useDispatch } from 'react-redux'
import { setDragNodeType, setIsDragging } from '../store/uiSlice'
import type { NodeType } from '../workflow-engine-core'
import './NodeToolbar.css'

interface NodeTypeInfo {
  type: NodeType
  name: string
  icon: string
  description: string
  color: string
}

const nodeTypes: NodeTypeInfo[] = [
  {
    type: 'trigger',
    name: 'Trigger',
    icon: '⚡',
    description: 'Start workflow execution',
    color: '#10b981'
  },
  {
    type: 'action',
    name: 'Action',
    icon: '🔧',
    description: 'Perform API calls and operations',
    color: '#3b82f6'
  },
  {
    type: 'table',
    name: 'Database',
    icon: '🗄️',
    description: 'Store and retrieve data',
    color: '#8b5cf6'
  },
  {
    type: 'page',
    name: 'Page',
    icon: '📄',
    description: 'Display data to users',
    color: '#06b6d4'
  },
  {
    type: 'email',
    name: 'Email',
    icon: '✉️',
    description: 'Send email notifications',
    color: '#ef4444'
  },
  {
    type: 'notification',
    name: 'Notification',
    icon: '🔔',
    description: 'Send push notifications',
    color: '#f59e0b'
  },
  {
    type: 'invoice',
    name: 'Invoice',
    icon: '🧾',
    description: 'Generate invoices',
    color: '#84cc16'
  },
  {
    type: 'report',
    name: 'Report',
    icon: '📊',
    description: 'Generate reports and analytics',
    color: '#ec4899'
  }
]

const NodeToolbar = () => {
  const dispatch = useDispatch()

  const handleDragStart = (nodeType: NodeType) => {
    dispatch(setDragNodeType(nodeType))
    dispatch(setIsDragging(true))
  }

  const handleDragEnd = () => {
    dispatch(setDragNodeType(null))
    dispatch(setIsDragging(false))
  }

  return (
    <div className="node-toolbar">
      <div className="toolbar-header">
        <h3>Node Library</h3>
        <p>Drag nodes to the canvas to build your workflow</p>
      </div>
      
      <div className="node-types">
        {nodeTypes.map(nodeType => (
          <div
            key={nodeType.type}
            className="node-type-item"
            draggable
            onDragStart={() => handleDragStart(nodeType.type)}
            onDragEnd={handleDragEnd}
            style={{ '--node-color': nodeType.color } as React.CSSProperties}
          >
            <div className="node-type-icon">{nodeType.icon}</div>
            <div className="node-type-info">
              <h4>{nodeType.name}</h4>
              <p>{nodeType.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="toolbar-footer">
        <div className="help-section">
          <h4>How to use:</h4>
          <ul>
            <li>Drag nodes from here to the canvas</li>
            <li>Click on nodes to configure them</li>
            <li>Connect nodes by dragging from output to input</li>
            <li>Start with a Trigger node</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NodeToolbar
