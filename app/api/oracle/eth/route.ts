import { NextResponse } from 'next/server'

const SOURCES = [
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  'https://api.coincap.io/v2/assets/ethereum',
]

export async function GET() {
  // Try CoinGecko first
  try {
    const res  = await fetch(SOURCES[0], { next: { revalidate: 30 } })
    const json = await res.json()
    const price = Math.round(json?.ethereum?.usd)
    if (!price || isNaN(price)) throw new Error('bad data')
    return NextResponse.json({ price, symbol: 'ETH', currency: 'USD', source: 'coingecko', ts: Date.now() })
  } catch {}

  // Fallback to CoinCap
  try {
    const res  = await fetch(SOURCES[1], { next: { revalidate: 30 } })
    const json = await res.json()
    const price = Math.round(parseFloat(json?.data?.priceUsd))
    if (!price || isNaN(price)) throw new Error('bad data')
    return NextResponse.json({ price, symbol: 'ETH', currency: 'USD', source: 'coincap', ts: Date.now() })
  } catch {}

  // Hardcoded fallback for demo stability
  return NextResponse.json({ price: 3750, symbol: 'ETH', currency: 'USD', source: 'fallback', ts: Date.now() })
}
