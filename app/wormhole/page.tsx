import { redirect } from 'next/navigation'

// The wormhole experience lives in the dashboard modal
// (components/BlackberryWormholeContent.tsx). This standalone route was
// orphaned: nothing linked to it. Redirect home like /web, /showreel,
// /favourites.
export default function Page() {
  redirect('/')
}
