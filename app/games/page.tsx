import type { Metadata } from 'next'
import BlackberryGamesContent from '@/components/BlackberryGamesContent'

export const metadata: Metadata = {
  title: 'Games | HandToMouse BB Mode',
  description: 'Three classic BB games — Snake, Memory Match, and Tic-Tac-Toe.',
  openGraph: {
    title: 'Games | HandToMouse BB Mode',
    description: 'Three classic BB games — Snake, Memory Match, and Tic-Tac-Toe.',
    url: 'https://htm-bb-mode.vercel.app/games',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <BlackberryGamesContent />
    </div>
  )
}
