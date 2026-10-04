export const fmtLong = d => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const fmtShort = d => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
export const todayISO = () => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
export const lastDayOfMonth = (year, month1) => new Date(year, month1, 0).getDate()

// Tries to read a start/end time out of slot labels like "Morning – 10am to 2pm" or "15:00-18:00"
function parseTimes(label = '') {
  const toMinutes = (h, m, ap) => {
    let hour = parseInt(h, 10)
    if (ap) {
      ap = ap.toLowerCase()
      if (ap === 'pm' && hour < 12) hour += 12
      if (ap === 'am' && hour === 12) hour = 0
    }
    return hour * 60 + (m ? parseInt(m, 10) : 0)
  }
  const re = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi
  const found = [...label.matchAll(re)].filter(x => x[2] || x[3])
  if (found.length < 2) return null
  let a = found[0], b = found[1]
  const apA = a[3] || b[3], apB = b[3] || a[3]
  return { start: toMinutes(a[1], a[2], apA), end: toMinutes(b[1], b[2], apB) }
}

// Builds an .ics file so customers can add the appointment to their calendar
export function buildICS({ date, label, title, description }) {
  const times = parseTimes(label)
  const pad = n => String(n).padStart(2, '0')
  const d = date.replace(/-/g, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SRJ Inked//Booking//EN', 'BEGIN:VEVENT']
  lines.push(`UID:${Date.now()}@srj-inked`)
  if (times) {
    lines.push(`DTSTART:${d}T${pad(Math.floor(times.start / 60))}${pad(times.start % 60)}00`)
    lines.push(`DTEND:${d}T${pad(Math.floor(times.end / 60))}${pad(times.end % 60)}00`)
  } else {
    lines.push(`DTSTART;VALUE=DATE:${d}`)
  }
  lines.push(`SUMMARY:${title}`)
  lines.push(`DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'))
}
