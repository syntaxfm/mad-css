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
      <section className="section rules">
        <div className="section-content">


        <h2>The Rules</h2>

        <p>
          Welcome to Mad CSS — the ultimate showdown of styling supremacy. Two competitors enter, one champion emerges. This ain't your grandma's CSS tutorial. This is war.
        </p>

        <h3>How It Works</h3>
        <p>
          Each round, competitors are given a visual target — a design they must recreate using only CSS. No images allowed. No SVGs. No cheating. Just pure, unadulterated stylesheet sorcery.
        </p>

        <h3>Scoring</h3>
        <ul>
          <li><strong>Accuracy (50 points max)</strong> — How closely does your output match the target? Pixel-perfect precision is rewarded.</li>
          <li><strong>Code Efficiency (25 points max)</strong> — Fewer characters = more points. Every byte counts.</li>
          <li><strong>Speed Bonus (15 points max)</strong> — First to submit gets the full speed bonus. Second place gets half. Everyone else gets zilch.</li>
          <li><strong>Style Points (10 points max)</strong> — Did you do something clever? Creative use of properties? Bonus points at the judges' discretion.</li>
        </ul>

        <h3>The Format</h3>
        <p>
          The tournament follows a single-elimination bracket. Win and advance. Lose and go home. Each match consists of three rounds — best of three takes the victory.
        </p>

        <h3>Allowed Properties</h3>
        <ul>
          <li>All standard CSS properties are fair game</li>
          <li>CSS custom properties (variables) are allowed</li>
          <li>Pseudo-elements (<code>::before</code>, <code>::after</code>) are encouraged</li>
          <li>Animations and transitions? Go wild.</li>
          <li>CSS math functions (<code>calc()</code>, <code>min()</code>, <code>max()</code>, <code>clamp()</code>) are your friends</li>
        </ul>

        <h3>Forbidden Arts</h3>
        <ul>
          <li><strong>No JavaScript</strong> — This is CSS battle, not JS battle</li>
          <li><strong>No external images</strong> — Data URIs are also banned</li>
          <li><strong>No SVG</strong> — Draw it with CSS or don't draw it at all</li>
          <li><strong>No preprocessors</strong> — No Sass, Less, or Stylus. Raw CSS only.</li>
          <li><strong>No AI assistance</strong> — Your brain, your fingers, your code</li>
        </ul>

        <h3>Time Limits</h3>
        <p>
          Each round has a strict 10-minute time limit. When the clock hits zero, whatever you've got is what gets judged. Incomplete submissions will be scored on what's visible. A blank canvas scores zero.
        </p>

        <h3>Tiebreakers</h3>
        <p>
          In the event of a tied score, the following tiebreakers apply in order:
        </p>
        <ol>
          <li>Fastest submission time wins</li>
          <li>Lowest character count wins</li>
          <li>Head-to-head sudden death round (5 minutes, simple target)</li>
          <li>Coin flip (we hope it never comes to this)</li>
        </ol>

        <h3>Code of Conduct</h3>
        <p>
          Keep it clean. Keep it fun. Trash talk is encouraged but keep it playful. We're here to celebrate CSS mastery, not tear each other down. Respect your opponents, respect the judges, and most importantly — respect the cascade.
        </p>

        <h3>Final Word</h3>
        <p>
          Remember: there are no bad CSS properties, only bad CSS developers. May your specificity be low, your selectors be clean, and your <code>!important</code>s be nonexistent. Good luck, and may the best stylist win.
        </p>
        </div>
      </section>
      {/* <Bracket /> */}
      {/* <SimpleBracket /> */}
    </div>
  )
}
