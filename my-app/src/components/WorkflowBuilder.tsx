import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { setCurrentView } from '../store/uiSlice'
import NodeToolbar from './NodeToolbar'
import WorkflowCanvas from './WorkflowCanvas'
import NodeConfigPanel from './NodeConfigPanel'
import './WorkflowBuilder.css'

const WorkflowBuilder = () => {
  const dispatch = useDispatch()
  const currentWorkflow = useSelector((state: RootState) => state.workflow.currentWorkflow)
  const { sidebarOpen, rightPanelOpen } = useSelector((state: RootState) => state.ui)

  const handleBackToDashboard = () => {
    dispatch(setCurrentView('dashboard'))
  }

  if (!currentWorkflow) {
    return (
      <div className="workflow-builder">
        <div className="no-workflow">
          <h2>No workflow selected</h2>
          <button onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="workflow-builder">
      <header className="workflow-builder-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={handleBackToDashboard}
          >
            ← Back to Dashboard
          </button>
          <h1>{currentWorkflow.name}</h1>
        </div>
        
        <div className="header-right">
          <button className="save-btn">Save</button>
          <button className="run-btn">Run Workflow</button>
        </div>
      </header>

      <div className="workflow-builder-content">
        {sidebarOpen && (
          <div className="sidebar">
            <NodeToolbar />
          </div>
        )}
        
        <div className="canvas-container">
          <WorkflowCanvas />
        </div>
        
        {rightPanelOpen && (
          <div className="right-panel">
            <NodeConfigPanel />
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowBuilder
