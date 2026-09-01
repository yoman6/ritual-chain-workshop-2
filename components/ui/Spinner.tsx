export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        display:      'inline-block',
        width:        size,
        height:       size,
        border:       `2px solid currentColor`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation:    'spin 0.7s linear infinite',
        flexShrink:   0,
      }}
    />
  )
}
