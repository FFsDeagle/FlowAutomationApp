import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { updateNodeInCurrentWorkflow, deleteNodeFromCurrentWorkflow } from '../store/workflowSlice'
import { setSelectedNodeId } from '../store/uiSlice'
import type { NodeConfig } from '../workflow-engine-core'
import './NodeConfigPanel.css'

const NodeConfigPanel = () => {
  const dispatch = useDispatch()
  const selectedNodeId = useSelector((state: RootState) => state.ui.selectedNodeId)
  const currentWorkflow = useSelector((state: RootState) => state.workflow.currentWorkflow)
  
  const selectedNode = currentWorkflow?.nodes.find(n => n.id === selectedNodeId)
  
  const [config, setConfig] = useState<NodeConfig | null>(null)

  useEffect(() => {
    if (selectedNode) {
      setConfig({ ...selectedNode })
    } else {
      setConfig(null)
    }
  }, [selectedNode])

  const handleConfigChange = (field: string, value: any) => {
    if (!config) return
    
    const updatedConfig = { ...config, [field]: value }
    setConfig(updatedConfig)
  }

  const handleSave = () => {
    if (!config) return
    
    dispatch(updateNodeInCurrentWorkflow(config))
  }

  const handleDelete = () => {
    if (!config) return
    
    if (confirm('Are you sure you want to delete this node?')) {
      dispatch(deleteNodeFromCurrentWorkflow(config.id))
      dispatch(setSelectedNodeId(null))
    }
  }

  const handleClose = () => {
    dispatch(setSelectedNodeId(null))
  }

  if (!config || !selectedNode) {
    return (
      <div className="node-config-panel">
        <div className="panel-header">
          <h3>Node Configuration</h3>
        </div>
        <div className="panel-content">
          <p>Select a node to configure its properties</p>
        </div>
      </div>
    )
  }

  const renderConfigFields = () => {
    switch (config.type) {
      case 'trigger':
        const triggerConfig = config as any
        return (
          <>
            <div className="form-group">
              <label>Trigger Type</label>
              <select
                value={triggerConfig.triggerType}
                onChange={(e) => handleConfigChange('triggerType', e.target.value)}
              >
                <option value="manual">Manual</option>
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule</option>
                <option value="event">Event</option>
              </select>
            </div>
            
            {triggerConfig.triggerType === 'schedule' && (
              <div className="form-group">
                <label>Schedule (Cron)</label>
                <input
                  type="text"
                  value={triggerConfig.schedule || ''}
                  onChange={(e) => handleConfigChange('schedule', e.target.value)}
                  placeholder="0 0 * * *"
                />
              </div>
            )}
            
            {triggerConfig.triggerType === 'webhook' && (
              <div className="form-group">
                <label>Webhook URL</label>
                <input
                  type="text"
                  value={triggerConfig.webhookUrl || ''}
                  onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            )}
          </>
        )

      case 'action':
        const actionConfig = config as any
        return (
          <>
            <div className="form-group">
              <label>API Endpoint</label>
              <input
                type="text"
                value={actionConfig.apiEndpoint || ''}
                onChange={(e) => handleConfigChange('apiEndpoint', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            
            <div className="form-group">
              <label>HTTP Method</label>
              <select
                value={actionConfig.method || 'GET'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </>
        )

      case 'table':
        const tableConfig = config as any
        return (
          <>
            <div className="form-group">
              <label>Table Name</label>
              <input
                type="text"
                value={tableConfig.tableName}
                onChange={(e) => handleConfigChange('tableName', e.target.value)}
                placeholder="table_name"
              />
            </div>
            
            <div className="form-group">
              <label>Operation</label>
              <select
                value={tableConfig.operation}
                onChange={(e) => handleConfigChange('operation', e.target.value)}
              >
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="query">Query</option>
              </select>
            </div>
          </>
        )

      case 'email':
        const emailConfig = config as any
        return (
          <>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={emailConfig.subject}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                placeholder="Email subject"
              />
            </div>
            
            <div className="form-group">
              <label>Recipients</label>
              <textarea
                value={emailConfig.recipients?.join(', ') || ''}
                onChange={(e) => handleConfigChange('recipients', e.target.value.split(',').map(s => s.trim()))}
                placeholder="email1@example.com, email2@example.com"
                rows={2}
              />
            </div>
            
            <div className="form-group">
              <label>Template</label>
              <textarea
                value={emailConfig.template}
                onChange={(e) => handleConfigChange('template', e.target.value)}
                placeholder="Email template with {{variables}}"
                rows={4}
              />
            </div>
          </>
        )

      case 'notification':
        const notificationConfig = config as any
        return (
          <>
            <div className="form-group">
              <label>Type</label>
              <select
                value={notificationConfig.notificationType}
                onChange={(e) => handleConfigChange('notificationType', e.target.value)}
              >
                <option value="push">Push Notification</option>
                <option value="sms">SMS</option>
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={notificationConfig.message}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Notification message"
                rows={3}
              />
            </div>
          </>
        )

      default:
        return <p>Configuration options for {config.type} coming soon...</p>
    }
  }

  return (
    <div className="node-config-panel">
      <div className="panel-header">
        <h3>Node Configuration</h3>
        <button className="close-btn" onClick={handleClose}>×</button>
      </div>
      
      <div className="panel-content">
        <div className="node-info">
          <h4>{config.name}</h4>
          <span className="node-type-badge">{config.type}</span>
        </div>
        
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => handleConfigChange('name', e.target.value)}
            placeholder="Node name"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={config.description || ''}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            placeholder="Node description (optional)"
            rows={2}
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleConfigChange('enabled', e.target.checked)}
            />
            Enabled
          </label>
        </div>
        
        <hr />
        
        {renderConfigFields()}
        
        <div className="panel-actions">
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete Node
          </button>
        </div>
      </div>
    </div>
  )
}

export default NodeConfigPanel
