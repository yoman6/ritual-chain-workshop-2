export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Outfit, DM_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { ExecutionWarningBanner } from '@/components/layout/ExecutionWarningBanner'
import { ChainGuard } from '@/components/wallet/ChainGuard'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'
import './globals.css'

const outfit      = Outfit({ subsets: ['latin'], variable: '--font-heading' })
const dmSans      = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Autonomous Markets — AI-Native Prediction Protocol',
  description: 'Autonomous prediction protocol with on-chain settlement powered by Ritual Chain',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body>
        <Providers>
          <div className="ambient-glow" aria-hidden />
          <Navbar />
          <DemoBanner />
          <ExecutionWarningBanner />
          <ChainGuard>
            <main className="page-content">{children}</main>
          </ChainGuard>
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
