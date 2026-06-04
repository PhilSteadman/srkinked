import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const DEFAULTS = {
  studio_photo_url: '',
  facebook_url: 'https://www.facebook.com/srjinked',
  instagram_url: 'https://www.instagram.com/srjinked',
  tiktok_url: 'https://www.tiktok.com/@s.r.j.inked',
  youtube_url: '',
  studio_address: 'Bristol, UK',
  contact_email: '',
  about_text: 'Based in Bristol, SRJ Inked specialises in bespoke tattoo art across every style. Every tattoo is designed exclusively for you.',
  about_text_2: 'Exceptional hygiene standards, premium inks, and a welcoming studio environment. Your comfort and confidence are the foundation of every session.',
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setSettings({ ...DEFAULTS, ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { settings, loading }
}
