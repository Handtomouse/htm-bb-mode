import { redirect } from 'next/navigation'

// Placeholder cards only (Templates/Tools/Experiments/Resources had no
// content or links). Redirect home like /web /showreel /favourites until
// real extras exist; the old markup is in git history.
export default function Page() {
  redirect('/')
}
