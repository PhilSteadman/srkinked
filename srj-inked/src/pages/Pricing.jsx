import React from 'react'
import {Link} from 'react-router-dom'
import {Check,Info} from 'lucide-react'
import './Pricing.css'
const TIERS=[
  {label:'Minimum Charge',price:'\u00a320',desc:'For very small pieces or touch-ups.',features:['Any small design','Walk-ins welcome','Consultation included']},
  {label:'Under An Hour',price:'\u00a330',desc:'Small-to-medium pieces in a single short session.',features:['Small to medium designs','Single session','Aftercare advice']},
  {label:'Per Hour',price:'\u00a340',sub:'per hour (over 1hr)',desc:'Larger custom work billed hourly. Ideal for sleeves and complex pieces.',features:['Any size or style','Custom design consultation','Progress photos','Aftercare pack'],featured:true},
  {label:'Half Day',price:'\u00a3150',sub:'4 hours \u00b7 Weekend only',desc:'Four uninterrupted hours for large-scale work. Weekends only.',features:['4 hours tattooing','Larger pieces & sleeves','Lunch break','Weekend only'],note:'Weekend Only'},
  {label:'Full Day',price:'\u00a3300',sub:'8 hours \u00b7 Weekend only',desc:'A full day dedicated to your tattoo. Maximum progress in one session.',features:['8 hours tattooing','Full sleeves / back pieces','Breaks scheduled','Weekend only','Best value per hour','Snacks & drinks'],note:'Weekend Only',featured:true},
]
const FAQ=[
  {q:'Do I need a deposit?',a:'Yes \u2014 a deposit secures your booking and is deducted from the final cost. Non-refundable within 48 hours of cancellation.'},
  {q:'Can I bring my own design?',a:'Absolutely. Bring reference images, sketches, or describe your vision. SRJ will refine and adapt any concept to work as a tattoo.'},
  {q:'What styles do you specialise in?',a:'Black & grey realism, traditional, neo-traditional, fine line, geometric, Japanese, and lettering. Not sure what fits? Get in touch for advice.'},
  {q:'What should I do before my appointment?',a:'Eat a good meal, stay hydrated, wear loose clothing over the area, and avoid alcohol for 24 hours prior.'},
  {q:'Do you do touch-ups?',a:'Free touch-ups within 3 months of your original tattoo if needed due to natural healing. After that, minimum charge applies.'},
  {q:'How do I book a consultation?',a:'Message via Instagram or Facebook (@srjinked), or use the online booking form to request a slot.'},
]
export default function Pricing(){return(
  <div className="pricing-page page-enter">
    <div className="page-hero"><p className="section-eyebrow">Transparent Rates</p><h1 className="section-title">Session <span>Pricing</span></h1><div className="gold-line" style={{margin:'1rem auto'}}/><p>Straightforward pricing. No hidden fees. Every quote confirmed before work begins.</p></div>
    <div className="container" style={{paddingTop:'4rem',paddingBottom:'2rem'}}>
      <div className="pricing-grid">
        {TIERS.map(t=>(
          <div key={t.label} className={`price-card${t.featured?' featured':''}`}>
            {t.featured&&<div className="price-badge">Most Popular</div>}
            {t.note&&!t.featured&&<div className="price-note-tag">{t.note}</div>}
            <p className="price-label">{t.label}</p>
            <p className="price-amount">{t.price}</p>
            {t.sub&&<p className="price-sub">{t.sub}</p>}
            <p className="price-desc">{t.desc}</p>
            <ul className="price-features">{t.features.map(f=><li key={f}><Check size={12}/>{f}</li>)}</ul>
            <Link to="/booking" className={`btn ${t.featured?'btn-gold':'btn-outline'}`} style={{marginTop:'auto',width:'100%',textAlign:'center'}}>Book This</Link>
          </div>
        ))}
      </div>
      <div className="pricing-info-bar">
        {[['January sale rates. Prices may return to standard after the promotional period.'],['Half day and full day sessions are weekend only and must be booked in advance.'],['Final quote agreed before work begins. No surprises.']].map(([t],i)=>(
          <div key={i} className="pib-item"><Info size={16} color="var(--gold)"/><p>{t}</p></div>
        ))}
      </div>
      <div className="pricing-faq">
        <h2 className="section-title">Common <span>Questions</span></h2><div className="gold-line"/>
        <div className="faq-grid">{FAQ.map(f=><div key={f.q} className="faq-item"><h4>{f.q}</h4><p>{f.a}</p></div>)}</div>
      </div>
      <div className="pricing-cta">
        <h3>Ready to get started?</h3><p>Book online or reach out on social media to discuss your idea first.</p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginTop:'2rem'}}>
          <Link to="/booking" className="btn btn-gold">Book Online</Link>
          <Link to="/contact" className="btn btn-outline">Get In Touch</Link>
        </div>
      </div>
    </div>
  </div>
)}
