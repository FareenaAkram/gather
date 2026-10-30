import { SessionProvider } from 'next-auth/react'
import Layout from '../components/layout/Layout'
import '../styles/globals.css'

// SessionProvider shares "who is signed in" with every component via useSession()
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Layout><Component {...pageProps} /></Layout>
    </SessionProvider>
  )
}

export default MyApp
