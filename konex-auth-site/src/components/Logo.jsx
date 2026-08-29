export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#131320" stroke="#26263c" />
      <g stroke="#8c6bff" strokeWidth="2.5" strokeLinecap="round">
        <line x1="20" y1="14" x2="20" y2="50" />
        <line x1="20" y1="32" x2="44" y2="14" />
        <line x1="20" y1="32" x2="44" y2="50" />
      </g>
      <circle cx="20" cy="14" r="4.5" fill="#8c6bff" />
      <circle cx="20" cy="32" r="4.5" fill="#ff6a4d" />
      <circle cx="20" cy="50" r="4.5" fill="#8c6bff" />
      <circle cx="44" cy="14" r="4.5" fill="#8c6bff" />
      <circle cx="44" cy="50" r="4.5" fill="#8c6bff" />
    </svg>
  )
}
