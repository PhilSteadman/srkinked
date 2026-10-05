import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export const SETTINGS_DEFAULTS = {
  studio_photo_url: '',
  hero_title: 'Where your story meets the canvas',
  hero_subtitle: 'Custom tattoos, drawn for you and nobody else.',
  hero_image_url: '',
  studio_location: '',
  facebook_url: 'https://www.facebook.com/srjinked',
  instagram_url: 'https://www.instagram.com/srjinked',
  tiktok_url: 'https://www.tiktok.com/@s.r.j.inked',
  youtube_url: '',
  studio_address: '',
  contact_email: '',
  about_text: 'Every piece starts with a conversation. You bring the idea, the story, the reference photos. I turn it into something that works on skin and still looks right in twenty years.',
  about_text_2: 'Clean studio, quality inks, and no rushing. Ask anything before we start.',
  price_minimum: '30',
  price_under_hour: '30',
  price_per_hour: '40',
  price_half_day: '150',
  price_full_day: '300',
  years_experience: '2+',
  tattoos_completed: '',
  deposit_amount: '',
  deposit_link: '',
  deposit_note: "The booking fee secures your slot and comes off the final price on the day. It is non-refundable if you cancel or don't turn up. If the studio has to cancel, you get it back in full.",
  booking_notice: '',
}

// One fetch shared by every component on the page
let cache = null
let inflight = null
const listeners = new Set()

function fetchSettings() {
  if (!inflight) {
    inflight = supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => {
        const clean = {}
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null && v !== undefined) clean[k] = v })
        cache = { ...SETTINGS_DEFAULTS, ...clean }
        listeners.forEach(fn => fn(cache))
        return cache
      })
      .catch(() => { cache = { ...SETTINGS_DEFAULTS }; return cache })
  }
  return inflight
}

// Call after saving settings in the admin so the site picks up changes
export function refreshSettings() {
  inflight = null
  return fetchSettings()
}

export function useSettings() {
  const [settings, setSettings] = useState(cache || SETTINGS_DEFAULTS)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    const fn = s => { setSettings(s); setLoading(false) }
    listeners.add(fn)
    if (cache) { setSettings(cache); setLoading(false) } else fetchSettings()
    return () => listeners.delete(fn)
  }, [])

  return { settings, loading }
}
