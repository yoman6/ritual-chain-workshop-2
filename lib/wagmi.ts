import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { ritualChain } from './chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Autonomous Markets',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'autonomous-markets-demo',
  chains: [ritualChain],   // ONLY Ritual Chain — never add others
  ssr: true,
})
