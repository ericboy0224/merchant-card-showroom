import { useSyncExternalStore } from 'react'
import { CardDetail, ShowroomList } from '@/features/showroom'
import './app.css'

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

/** Hash routes: `#/` is the list. `#/card/<id>` is the detail. */
function useRoute(): { name: 'list' } | { name: 'card'; id: string } {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '')
  const m = /^#\/card\/(.+)$/.exec(hash)
  return m ? { name: 'card', id: decodeURIComponent(m[1]) } : { name: 'list' }
}

export function App() {
  const route = useRoute()
  return (
    <>
      <header>
        <h1>Merchant Card Showroom</h1>
      </header>
      <main>{route.name === 'card' ? <CardDetail id={route.id} /> : <ShowroomList />}</main>
    </>
  )
}
