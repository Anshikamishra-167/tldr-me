// The 5 complexity levels — used by the slider and sent to the backend
export const LEVELS = [
  {
    value: 0,
    name: '5-Year-Old',
    emoji: '🧒',
    desc: 'simple words, playful tone',
    color: '#7fe8c8',
    example: 'Like when you share your toys...'
  },
  {
    value: 1,
    name: 'Middle School',
    emoji: '🎒',
    desc: 'clear, relatable, everyday language',
    color: '#a8d8ff',
    example: 'Think of it like a school project...'
  },
  {
    value: 2,
    name: 'College',
    emoji: '🎓',
    desc: 'structured, analytical, clear',
    color: '#c8b4ff',
    example: 'The core principle involves...'
  },
  {
    value: 3,
    name: 'Expert',
    emoji: '💼',
    desc: 'domain language, precise, dense',
    color: '#ffb8e0',
    example: 'Leveraging domain-specific frameworks...'
  },
  {
    value: 4,
    name: 'PhD',
    emoji: '🔬',
    desc: 'academic, rigorous, full terminology',
    color: '#ff9de2',
    example: 'The epistemological underpinnings...'
  }
]

// Debounce delay in ms — how long to wait after slider stops moving before calling API
export const DEBOUNCE_MS = 900
