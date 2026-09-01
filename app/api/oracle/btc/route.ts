import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res  = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', { next: { revalidate: 30 } })
    const json = await res.json()
    const price = Math.round(json?.bitcoin?.usd)
    if (!price || isNaN(price)) throw new Error('bad data')
    return NextResponse.json({ price, symbol: 'BTC', currency: 'USD', source: 'coingecko', ts: Date.now() })
  } catch {}

  try {
    const res  = await fetch('https://api.coincap.io/v2/assets/bitcoin', { next: { revalidate: 30 } })
    const json = await res.json()
    const price = Math.round(parseFloat(json?.data?.priceUsd))
    if (!price || isNaN(price)) throw new Error('bad data')
    return NextResponse.json({ price, symbol: 'BTC', currency: 'USD', source: 'coincap', ts: Date.now() })
  } catch {}

  return NextResponse.json({ price: 97000, symbol: 'BTC', currency: 'USD', source: 'fallback', ts: Date.now() })
}
