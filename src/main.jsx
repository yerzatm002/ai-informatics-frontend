import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { AgentProvider } from './contexts/AgentContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AgentProvider>
          <App />
        </AgentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
