import { useEffect, useRef, useState } from 'react'
import { agentApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useAgent } from '../contexts/AgentContext'
import { getErrorMessage } from '../utils/errors'

export default function AIAgentWidget() {
  const { user } = useAuth()
  const { isOpen, context, openAgent, closeAgent } = useAgent()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Сәлем! Мен информатика пәні бойынша ЖИ-көмекшімін. Тақырыпты түсіндіруге немесе тапсырмаға бағыт беруге көмектесемін.' },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  const enabled = user?.experiment_group === 'AI'

  useEffect(() => {
    if (context.starter && isOpen) setInput(context.starter)
  }, [context.starter, isOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (!enabled) return null

  const send = async (event) => {
    event?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const { data } = await agentApi.chat({
        message: text,
        topic_id: context.topicId || null,
        task_id: context.taskId || null,
      })
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: data.response,
        action: data.action,
        attempts: data.attempts,
      }])
      } catch (error) {
        console.error('AI Agent error:', error)

        let errorText = 'ЖИ-агентке қосылу мүмкін болмады. Қайтадан байқап көріңіз.'

        if (
          error.code === 'ECONNABORTED' ||
          error.message?.toLowerCase().includes('timeout')
        ) {
          errorText =
            'Жауап күту уақыты аяқталды. Бірнеше секундтан кейін қайта байқап көріңіз.'
        } else if (error.response?.status === 503) {
          errorText =
            'ЖИ қызметі уақытша қолжетімсіз. Бірнеше секундтан кейін қайта байқап көріңіз.'
        } else if (error.response?.status === 429) {
          errorText =
            'ЖИ қызметіне сұраныстар саны уақытша шектелді. Сәл кейінірек қайта байқап көріңіз.'
        } else {
          errorText = getErrorMessage(
            error,
            'ЖИ-агентке қосылу мүмкін болмады'
          )
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'error',
            text: errorText,
          },
        ])
      } finally {
      setSending(false)
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => openAgent()}
          className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-2xl bg-violet-600 px-4 py-3 font-bold text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-violet-700 lg:left-auto lg:right-6"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20">✦</span>
          ЖИ-көмекші
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[70vh] max-h-[650px] flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-2xl sm:left-auto sm:right-5 sm:w-[390px]">
          <div className="flex items-center justify-between bg-violet-600 px-5 py-4 text-white">
            <div>
              <div className="flex items-center gap-2 font-black"><span>✦</span> AI Tutor</div>
              <div className="mt-0.5 text-xs text-violet-100">Контекстік оқу қолдауы</div>
            </div>
            <button onClick={closeAgent} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-xl hover:bg-white/20">×</button>
          </div>

          {(context.topicId || context.taskId) && (
            <div className="border-b border-violet-100 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
              Контекст: {context.topicId ? `тақырып #${context.topicId}` : ''}{context.taskId ? ` · тапсырма #${context.taskId}` : ''}
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.role === 'error'
                      ? 'border border-red-200 bg-red-50 text-red-700'
                      : 'border border-slate-200 bg-white text-slate-700'
                }`}>
                  {message.action && (
                    <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-violet-600">{message.action} · attempts {message.attempts}</div>
                  )}
                  {message.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Жауап дайындауда...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(e)
                  }
                }}
                rows={2}
                placeholder="Сұрағыңызды жазыңыз..."
                className="input resize-none py-2.5 text-sm"
              />
              <button disabled={sending || !input.trim()} className="btn-primary self-end px-4">→</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
