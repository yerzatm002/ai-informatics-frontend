import { createContext, useContext, useMemo, useState } from 'react'

const AgentContext = createContext(null)

export function AgentProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState({ topicId: null, taskId: null, starter: '' })

  const openAgent = (next = {}) => {
    setContext((prev) => ({ ...prev, ...next }))
    setIsOpen(true)
  }

  const closeAgent = () => setIsOpen(false)
  const clearContext = () => setContext({ topicId: null, taskId: null, starter: '' })

  const value = useMemo(() => ({
    isOpen,
    context,
    openAgent,
    closeAgent,
    clearContext,
    setContext,
  }), [isOpen, context])

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) throw new Error('useAgent must be used inside AgentProvider')
  return context
}
