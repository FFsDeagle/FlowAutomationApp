import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { setCurrentView } from '../store/uiSlice'
import { addWorkflow, setCurrentWorkflow, deleteWorkflow } from '../store/workflowSlice'
import type { Workflow } from '../workflow-engine-core'
import './Dashboard.css'

const Dashboard = () => {
  const dispatch = useDispatch()
  const workflows = useSelector((state: RootState) => state.workflow.workflows)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) return

    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newWorkflowName,
      description: newWorkflowDescription,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false,
      nodes: [],
      connections: [],
      settings: {
        errorHandling: 'stop',
      },
    }

    dispatch(addWorkflow(newWorkflow))
    dispatch(setCurrentWorkflow(newWorkflow))
    dispatch(setCurrentView('workflow-builder'))
    setShowCreateModal(false)
    setNewWorkflowName('')
    setNewWorkflowDescription('')
  }

  const handleEditWorkflow = (workflow: Workflow) => {
    dispatch(setCurrentWorkflow(workflow))
    dispatch(setCurrentView('workflow-builder'))
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      dispatch(deleteWorkflow(workflowId))
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Workflow Automation Platform</h1>
        <button 
          className="create-workflow-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Workflow
        </button>
      </header>

      <div className="dashboard-content">
        <div className="workflows-grid">
          {workflows.length === 0 ? (
            <div className="empty-state">
              <h3>No workflows yet</h3>
              <p>Create your first workflow to get started with automation</p>
              <button 
                className="create-first-workflow-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Create First Workflow
              </button>
            </div>
          ) : (
            workflows.map(workflow => (
              <div key={workflow.id} className="workflow-card">
                <div className="workflow-card-header">
                  <h3>{workflow.name}</h3>
                  <div className="workflow-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditWorkflow(workflow)}
                      title="Edit workflow"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      title="Delete workflow"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className="workflow-description">
                  {workflow.description || 'No description'}
                </p>
                
                <div className="workflow-stats">
                  <div className="stat">
                    <span className="stat-label">Nodes:</span>
                    <span className="stat-value">{workflow.nodes.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Status:</span>
                    <span className={`stat-value status ${workflow.isActive ? 'active' : 'inactive'}`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="workflow-meta">
                  <small>Created: {formatDate(workflow.createdAt)}</small>
                  <small>Updated: {formatDate(workflow.updatedAt)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Workflow</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="workflow-name">Workflow Name *</label>
                <input
                  id="workflow-name"
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="workflow-description">Description</label>
                <textarea
                  id="workflow-description"
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Enter workflow description (optional)"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName.trim()}
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
