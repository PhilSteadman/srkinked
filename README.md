# SRJ Inked — website (v16 remodel)

React + Vite site on Netlify, data on Supabase, emails through EmailJS.

## Upgrading to v16 — do these in order

1. **Database**: Supabase → SQL Editor → paste all of `supabase-remodel.sql` → Run.
   Safe to run more than once. Do this at about the same time as step 2,
   because public bookings now go through the new `book_slot` function.
2. **Code**: replace the files in your GitHub repo with this folder and push.
   (GitHub Desktop is the easiest way to push a whole folder.)
3. **Site settings** (yoursite/admin → Site settings):
   - Deposit amount and payment link (Stripe Payment Link, PayPal.me or Monzo.me)
   - Your town/area (leave blank to hide)
   - Check "Tattoos done": clear it unless the number is accurate
   - Optional: hero headline and hero photo
4. **Emails** (EmailJS dashboard), see `emails/`:
   - Studio notification: paste `emails/studio-booking-notification.html` into your
     existing booking template (adds reference photo and flash design).
   - Customer confirmation (new): create a template, paste
     `emails/customer-confirmation.html`, set **To Email** to `{{to_email}}` and
     **Reply To** to `srjinked@gmail.com`. Add its ID to Netlify as
     `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`, then redeploy.

## Environment variables (Netlify)

| Name | Needed for |
|---|---|
| VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY | Everything |
| VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY | All emails |
| VITE_EMAILJS_TEMPLATE_ID | Contact form email |
| VITE_EMAILJS_BOOKING_TEMPLATE_ID | Booking email to you |
| VITE_EMAILJS_CUSTOMER_TEMPLATE_ID | Booking email to the customer (optional) |
| VITE_YOUTUBE_API_KEY, VITE_YOUTUBE_CHANNEL_ID | Videos page (optional) |

`VITE_INSTAGRAM_ACCESS_TOKEN` is no longer used and can be deleted.
Env vars only take effect after a new deploy.

## Sections that hide themselves until you add content
Flash, reviews, journal, events, social strip and the homepage spotlight only
appear once there's something to show, so the site never shows empty boxes.
