import { createFileRoute } from '@tanstack/react-router'
import { Bracket } from '@/components/bracket/Bracket'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <Bracket />
    </div>
  )
}
