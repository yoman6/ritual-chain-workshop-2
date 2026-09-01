'use client'
import { useEffect } from 'react'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppModeProvider, useAppMode } from '@/contexts/AppModeContext'
import { wagmiConfig } from '@/lib/wagmi'
import { RITUAL_CHAIN_ID } from '@/lib/constants'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

const ritualTheme = darkTheme({
  accentColor:           '#6366f1',
  accentColorForeground: '#ffffff',
  borderRadius:          'medium',
  fontStack:             'system',
  overlayBlur:           'large',
})

// Auto-switches wallet to Ritual Chain when user connects in live mode
function AutoSwitchChain() {
  const { chainId, isConnected } = useAccount()
  const { switchChain }          = useSwitchChain()
  const { mode }                 = useAppMode()

  useEffect(() => {
    if (mode === 'live' && isConnected && chainId !== RITUAL_CHAIN_ID) {
      switchChain({ chainId: RITUAL_CHAIN_ID })
    }
  }, [chainId, isConnected, mode, switchChain])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={ritualTheme}>
          <AppModeProvider>
            <AutoSwitchChain />
            {children}
          </AppModeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
