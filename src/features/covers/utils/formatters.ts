import { format, parse } from 'date-fns'

export function formatEventTime(timeStr: string | undefined | null): string {
  if (!timeStr) return ''
  try {
    // Handle HH:mm:ss format from Postgres
    const parsed = parse(timeStr.slice(0, 5), 'HH:mm', new Date())
    return format(parsed, 'h:mm a')
  } catch (e) {
    return timeStr || ''
  }
}

export function getClubColors(clubName: string | undefined): {
  border: string
  bg: string
  text: string
  dot: string
  bgHex: string
  textHex: string
  borderHex: string
} {
  const name = clubName || ''
  if (name.includes('Art')) {
    return {
      border: 'border-l-purple-500',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
      bgHex: '#f3e8ff', // hsl(270, 70%, 96%)
      textHex: '#7e22ce',
      borderHex: '#a855f7',
    }
  }
  if (name.includes('Coding')) {
    return {
      border: 'border-l-blue-500',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      bgHex: '#dbeafe',
      textHex: '#1d4ed8',
      borderHex: '#3b82f6',
    }
  }
  if (name.includes('Football')) {
    return {
      border: 'border-l-green-500',
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
      bgHex: '#dcfce7',
      textHex: '#15803d',
      borderHex: '#22c55e',
    }
  }
  if (name.includes('Drama')) {
    return {
      border: 'border-l-slate-400',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      bgHex: '#f8fafc',
      textHex: '#334155',
      borderHex: '#94a3b8',
    }
  }
  if (name.includes('Dance')) {
    return {
      border: 'border-l-pink-500',
      bg: 'bg-pink-100',
      text: 'text-pink-700',
      dot: 'bg-pink-500',
      bgHex: '#fce7f3',
      textHex: '#be185d',
      borderHex: '#ec4899',
    }
  }
  return {
    border: 'border-l-gray-300',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    bgHex: '#f3f4f6',
    textHex: '#374151',
    borderHex: '#d1d5db',
  }
}

/**
 * Safely parses a "YYYY-MM-DD" date string from Supabase into a local Date object,
 * avoiding any UTC/timezone shifting issues.
 */
export function parseLocalDate(dateStr: string | undefined | null): Date {
  if (!dateStr) return new Date()

  try {
    // Handle both YYYY-MM-DD and ISO strings
    const str = dateStr.substring(0, 10)
    const [year, month, day] = str.split('-').map(Number)

    // Validate numeric values
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return new Date()
    }

    // month - 1 because JS months are 0-indexed
    const date = new Date(year, month - 1, day)

    // Validate that the Date object is valid
    if (!isValidDate(date)) {
      return new Date()
    }

    return date
  } catch (e) {
    return new Date()
  }
}

/**
 * Validates that a Date object is valid (not NaN).
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

// Deterministic color palette for schools. Uses a simple hash of the school name
// to pick a color from the palette so each school has a consistent color.
export function getSchoolColors(schoolName: string | undefined): {
  border: string
  bg: string
  text: string
  dot: string
  bgHex: string
  textHex: string
  borderHex: string
} {
  const palette = [
    {
      border: 'border-l-blue-500',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      bgHex: '#dbeafe',
      textHex: '#1d4ed8',
      borderHex: '#3b82f6',
    },
    {
      border: 'border-l-green-500',
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
      bgHex: '#dcfce7',
      textHex: '#15803d',
      borderHex: '#22c55e',
    },
    {
      border: 'border-l-purple-500',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
      bgHex: '#f3e8ff',
      textHex: '#7e22ce',
      borderHex: '#a855f7',
    },
    {
      border: 'border-l-pink-500',
      bg: 'bg-pink-100',
      text: 'text-pink-700',
      dot: 'bg-pink-500',
      bgHex: '#fce7f3',
      textHex: '#be185d',
      borderHex: '#ec4899',
    },
    {
      border: 'border-l-slate-400',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      bgHex: '#f8fafc',
      textHex: '#334155',
      borderHex: '#94a3b8',
    },
    {
      border: 'border-l-gray-300',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
      bgHex: '#f3f4f6',
      textHex: '#374151',
      borderHex: '#d1d5db',
    },
  ]

  if (!schoolName) return palette[5]

  let h = 0
  for (let i = 0; i < schoolName.length; i++) {
    h = (h << 5) - h + schoolName.charCodeAt(i)
    h |= 0
  }
  const idx = Math.abs(h) % palette.length
  return palette[idx]
}
