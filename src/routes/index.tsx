import { createFileRoute } from '@tanstack/react-router'
import {
  Route as RouteIcon,
  Server,
  Shield,
  Sparkles,
  Waves,
  Zap,
} from 'lucide-react'
import { Roster } from '@/components/Roster'
import { Ticket } from '@/components/Ticket'

export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
    <div>
      {/* <h1 className="heading">Mad CSS</h1> */}
      <Ticket />
      {/* <Roster /> */}
    </div>
  )
}
