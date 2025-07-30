import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Dashboard from './components/Dashboard'
// Ensure the file exists at the specified path, or update the import if necessary
import WorkflowBuilder from './components/WorkflowBuilder'
import './App.css'

function App() {
  const currentView = useSelector((state: RootState) => state.ui.currentView)

  return (
    <div className="app">
      {currentView === 'dashboard' ? <Dashboard /> : <WorkflowBuilder />}
    </div>
  )
}

export default App
