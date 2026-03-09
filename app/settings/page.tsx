import type { Metadata } from 'next'
import SettingsContent from './SettingsContent'

export const metadata: Metadata = {
  title: 'Settings | HandToMouse BB Mode',
  description: 'Customise your HandToMouse BB Mode experience.',
  openGraph: {
    title: 'Settings | HandToMouse BB Mode',
    description: 'Customise your HandToMouse BB Mode experience.',
    url: 'https://htm-bb-mode.vercel.app/settings',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function SettingsPage() {
  return <SettingsContent />
}
