import { useEffect, useState } from 'react'
import { getInfo } from './api/chat.js'
import { useChat } from './hooks/useChat.js'
import Header from './components/Header.jsx'
import MessageList from './components/MessageList.jsx'
import Composer from './components/Composer.jsx'
import Inspector from './components/Inspector.jsx'

export default function App() {
  const [info, setInfo] = useState(null) // { provider, model, systemPrompt } from GET /info
  const [online, setOnline] = useState(null) // null = still checking

  useEffect(() => {
    getInfo()
      .then((data) => {
        setInfo(data)
        setOnline(true)
      })
      .catch(() => setOnline(false))
  }, [])

  const chat = useChat(info?.systemPrompt ?? '')

  return (
    <>
      <Header info={info} online={online} />
      <main className="layout">
        <section className="chat">
          <MessageList messages={chat.messages} onPick={chat.send} />
          <Composer
            busy={chat.busy}
            mode={chat.mode}
            setMode={chat.setMode}
            sendHistory={chat.sendHistory}
            setSendHistory={chat.setSendHistory}
            historyCount={chat.history.length}
            onSend={chat.send}
            onStop={chat.stop}
            onClear={chat.clear}
          />
        </section>
        <Inspector data={chat.inspect} />
      </main>
    </>
  )
}
