import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getSession } from '../../auth/session'
import { getChatRecommendation } from '../../services/api'

const DEFAULT_QUESTIONS = [
  'What book should I read next?',
  'Suggest 3 fiction books for this weekend.',
  'I want soft-skill books to improve communication.',
]

function buildInitialSession() {
  const id = `session-${Date.now()}`
  return {
    id,
    title: 'New chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  }
}

function normalizeSessionTitle(title) {
  const value = String(title || '').trim()
  if (!value) {
    return 'New chat'
  }

  const lower = value.toLowerCase()
  if (lower === 'hoi thoai moi' || lower === 'hội thoại mới') {
    return 'New chat'
  }
  if (lower === 'chao ban' || lower === 'chào bạn') {
    return 'Hello'
  }

  return value
}

export default function ChatSupportPage() {
  const session = getSession()
  const [question, setQuestion] = useState('')
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [editingSessionId, setEditingSessionId] = useState('')
  const [editingTitle, setEditingTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const logRef = useRef(null)

  const userId = useMemo(() => session?.email || session?.name || 'guest', [session])
  const storageKey = useMemo(() => `bookops_chat_sessions:${userId}`, [userId])

  const activeSession = useMemo(
    () => sessions.find((item) => item.id === activeSessionId) || null,
    [sessions, activeSessionId],
  )

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        const initialSession = buildInitialSession()
        setSessions([initialSession])
        setActiveSessionId(initialSession.id)
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const initialSession = buildInitialSession()
        setSessions([initialSession])
        setActiveSessionId(initialSession.id)
        return
      }

      const normalizedSessions = parsed.map((item) => ({
        ...item,
        title: normalizeSessionTitle(item.title),
      }))

      setSessions(normalizedSessions)
      setActiveSessionId(normalizedSessions[0].id)
    } catch {
      const fallbackSession = buildInitialSession()
      setSessions([fallbackSession])
      setActiveSessionId(fallbackSession.id)
    }
  }, [storageKey])

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(sessions))
    }
  }, [sessions, storageKey])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [activeSession?.messages?.length, loading])

  function createSession() {
    const nextSession = buildInitialSession()
    setSessions((prev) => [nextSession, ...prev])
    setActiveSessionId(nextSession.id)
    setQuestion('')
    setError('')
  }

  function removeSession(sessionId) {
    setSessions((prev) => {
      const next = prev.filter((item) => item.id !== sessionId)
      if (next.length === 0) {
        const initialSession = buildInitialSession()
        setActiveSessionId(initialSession.id)
        return [initialSession]
      }

      if (sessionId === activeSessionId) {
        setActiveSessionId(next[0].id)
      }

      return next
    })
  }

  function renameSession(sessionId) {
    const target = sessions.find((item) => item.id === sessionId)
    if (!target) return
    setEditingSessionId(sessionId)
    setEditingTitle(target.title)
  }

  function cancelRename() {
    setEditingSessionId('')
    setEditingTitle('')
  }

  function saveRename(sessionId) {
    const cleaned = normalizeSessionTitle(editingTitle)
    setSessions((prev) => prev.map((item) => (
      item.id === sessionId
        ? {
          ...item,
          title: cleaned,
          updatedAt: Date.now(),
        }
        : item
    )))
    cancelRename()
  }

  function renameByFirstQuestion(text) {
    const trimmed = text.trim()
    if (!trimmed) {
      return 'New chat'
    }
    return trimmed.length > 44 ? `${trimmed.slice(0, 44)}...` : trimmed
  }

  function appendMessage(sessionId, message, titleSeed) {
    setSessions((prev) => prev.map((item) => {
      if (item.id !== sessionId) {
        return item
      }
      return {
        ...item,
        title: item.messages.length === 0 && titleSeed ? renameByFirstQuestion(titleSeed) : item.title,
        updatedAt: Date.now(),
        messages: [...item.messages, message],
      }
    }))
  }

  async function submitQuestion(event) {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || !activeSessionId) {
      return
    }

    setError('')
    setLoading(true)

    const userMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      ts: Date.now(),
    }
    appendMessage(activeSessionId, userMessage, trimmed)

    try {
      const history = (activeSession?.messages || []).slice(-10).map((item) => ({
        role: item.role,
        text: item.text,
      }))

      const response = await getChatRecommendation({
        user_id: userId,
        question: trimmed,
        top_k: 3,
        session_id: activeSessionId,
        history,
      })

      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        books: response.retrieved || [],
        source: response.source,
        ts: Date.now(),
      }
      appendMessage(activeSessionId, aiMessage)
      setQuestion('')
    } catch {
      setError('AI service is temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="panel chat-shell">
        <aside className="chat-session-list">
          <div className="chat-session-header">
            <h3>Sessions</h3>
            <button type="button" className="primary-btn" onClick={createSession}>New</button>
          </div>
          <div className="chat-session-items">
            {sessions.map((item) => (
              <article
                key={item.id}
                className={`chat-session-item ${item.id === activeSessionId ? 'active' : ''}`}
              >
                {editingSessionId === item.id ? (
                  <div className="chat-session-main chat-session-main-editing">
                    <input
                      className="chat-session-edit-input"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          saveRename(item.id)
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          cancelRename()
                        }
                      }}
                      autoFocus
                    />
                    <span>{new Date(item.updatedAt).toLocaleString()}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="chat-session-main"
                    onClick={() => setActiveSessionId(item.id)}
                  >
                    <strong>{item.title}</strong>
                    <span>{new Date(item.updatedAt).toLocaleString()}</span>
                  </button>
                )}

                {editingSessionId === item.id ? (
                  <button
                    type="button"
                    className="chat-session-rename"
                    onClick={() => saveRename(item.id)}
                    aria-label={`Save session name ${item.title}`}
                    title="Save"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    className="chat-session-rename"
                    onClick={() => renameSession(item.id)}
                    aria-label={`Rename session ${item.title}`}
                    title="Rename session"
                  >
                    Rename
                  </button>
                )}

                <button
                  type="button"
                  className="chat-session-delete"
                  onClick={() => {
                    if (editingSessionId === item.id) {
                      cancelRename()
                    }
                    removeSession(item.id)
                  }}
                  aria-label={`Delete session ${item.title}`}
                  title="Delete session"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </aside>

        <div className="chat-main">
          <div className="chat-log" aria-live="polite" ref={logRef}>
            {!activeSession || activeSession.messages.length === 0 ? (
              <p className="empty-note">No messages yet. Ask your first question to get book recommendations.</p>
            ) : null}

            {activeSession?.messages.map((message) => (
              <article key={message.id} className={`chat-bubble chat-${message.role}`}>
                <p className="chat-role">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                  {message.role === 'assistant' && message.source ? (
                    <span className="chat-source">{message.source}</span>
                  ) : null}
                </p>
                <p>{message.text}</p>
                {message.role === 'assistant' && message.books?.length ? (
                  <ul className="simple-list chat-book-list">
                    {message.books.map((book) => (
                      <li key={`${message.id}-${book.product_id}`}>
                        <strong>{book.title}</strong>
                        <p>
                          {book.author} | {book.category} | score: {Number(book.score || 0).toFixed(3)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

            {loading ? <p className="chat-typing">AI is drafting a reply...</p> : null}
          </div>

          <form onSubmit={submitQuestion} className="chat-form" aria-label="Chat with AI">
            <div className="chat-suggestion-row" role="group" aria-label="Suggested prompts">
              {DEFAULT_QUESTIONS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="ghost-btn"
                  onClick={() => setQuestion(sample)}
                  disabled={loading}
                >
                  {sample}
                </button>
              ))}
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="chat-input-row">
              <input
                id="chat-question"
                placeholder="Ask about books, prices, genres, or personalized suggestions..."
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
              <button type="submit" className="primary-btn" disabled={loading || !question.trim()}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
