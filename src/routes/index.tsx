import { createFileRoute } from '@tanstack/react-router'
import { Bracket } from '@/components/bracket/Bracket'
import { SimpleBracket } from '@/components/bracket/SimpleBracket'
import { Ticket } from '@/components/Ticket'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <Ticket/>
      <Bracket />
      {/* <SimpleBracket /> */}
    </div>
  )
}
