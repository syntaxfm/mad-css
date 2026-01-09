import { createFileRoute } from '@tanstack/react-router'
import { Bracket } from '@/components/bracket/Bracket'
import { SimpleBracket } from '@/components/bracket/SimpleBracket'
import { Roster } from '@/components/roster/Roster'
import { Ticket } from '@/components/Ticket'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <Ticket/>
      <div className="section">
        <div className="section-content">
          <Roster />
        </div>
      </div>
      <div className="section">
          <h2>The Bracket</h2>
          <Bracket />
      </div>
      <section className="section rules">
        <div className="section-content">


        <h2>The Rules</h2>
        <p className="center">
          The rules are coming
        </p>
        </div>
      </section>
      {/* <Bracket /> */}
      {/* <SimpleBracket /> */}

    </div>
  )
}
