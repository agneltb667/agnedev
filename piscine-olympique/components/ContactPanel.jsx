'use client'

import { useEffect, useState } from 'react'
import { BOOKABLE, slotsFor, PHONE, CLOSED_DAY, DEMO } from '@/lib/data'
import { useFormule } from '@/lib/formule'

const KEY = 'pod-reservations'
const phoneOk = (v) => /^(\+?221)?\s*[37]\d(\s?\d){7}$/.test(v.trim())
const emailOk = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const fmtDate = (v) =>
  v ? new Date(`${v}T12:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'
const isoLocal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const loadRes = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}
const saveRes = (v) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {}
}

const inputCls =
  'w-full border-0 bg-transparent py-2 font-serif text-xl text-foam outline-none placeholder:text-foam/25 [color-scheme:dark]'

// Champ avec une ligne de base fine qui s'illumine au focus
function Field({ label, error, children }) {
  return (
    <label className="group block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-foam/45 transition-colors duration-300 group-focus-within:text-tide">
        {label}
      </span>
      <span className="relative block">
        {children}
        <span className="absolute bottom-0 left-0 h-px w-full bg-foam/15" />
        <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-tide shadow-[0_0_12px_#7fd6e8] transition-transform duration-500 ease-out group-focus-within:scale-x-100" />
      </span>
      {error && <span className="mt-1 block font-mono text-[10px] tracking-wider text-coral">{error}</span>}
    </label>
  )
}

function Submit({ children }) {
  return (
    <button
      type="submit"
      className="group relative mt-2 flex w-full items-center justify-between overflow-hidden border border-tide/50 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-foam transition-colors duration-500 hover:text-abyss"
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-tide transition-transform duration-500 ease-out group-hover:scale-x-100" />
      <span className="relative">{children}</span>
      <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
    </button>
  )
}

function Notice({ children }) {
  return (
    <div role="status" className="border-l border-tide bg-tide/10 px-5 py-4 text-sm leading-relaxed text-foam/90">
      {DEMO && (
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-coral">
          Démonstration — rien n’est transmis à la piscine
        </span>
      )}
      {children}
    </div>
  )
}

const emptyBooking = { activity: '', date: '', slot: '', people: '1', name: '', phone: '', email: '' }

function BookingForm({ initialActivity = '' }) {
  const [f, setF] = useState({ ...emptyBooking, activity: initialActivity })
  const [err, setErr] = useState({})
  const [done, setDone] = useState(null)
  const [list, setList] = useState([])
  const [bounds, setBounds] = useState({ min: '', max: '' })

  useEffect(() => {
    setList(loadRes())
    const now = new Date()
    const max = new Date()
    max.setDate(max.getDate() + 60)
    setBounds({ min: isoLocal(now), max: isoLocal(max) })
    const pick = (e) => setF((s) => ({ ...s, activity: e.detail }))
    window.addEventListener('pod:book', pick)
    return () => window.removeEventListener('pod:book', pick)
  }, [])

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const slots = slotsFor(f.activity)

  // un créneau qui n'existe pas pour la nouvelle activité est désélectionné
  useEffect(() => {
    if (f.slot && !slots.includes(f.slot)) setF((s) => ({ ...s, slot: '' }))
  }, [f.slot, slots])

  const submit = (e) => {
    e.preventDefault()
    const n = Number(f.people)
    const er = {}
    if (!f.activity) er.activity = 'Choisissez une activité.'
    if (!f.date) er.date = 'Choisissez une date.'
    else if (f.date < bounds.min) er.date = 'Cette date est passée.'
    else if (f.date > bounds.max) er.date = 'Réservation possible jusqu’à 60 jours.'
    else if (new Date(`${f.date}T12:00`).getDay() === CLOSED_DAY) er.date = 'Fermé le lundi (entretien).'
    if (!(n >= 1 && n <= 20)) er.people = 'Entre 1 et 20.'
    if (!f.slot) er.slot = 'Choisissez un créneau.'
    if (f.name.trim().length < 2) er.name = 'Indiquez votre nom.'
    if (!phoneOk(f.phone)) er.phone = 'Numéro invalide (ex. 77 123 45 67).'
    if (!emailOk(f.email)) er.email = 'E-mail invalide.'
    setErr(er)
    if (Object.keys(er).length) return

    const act = BOOKABLE.find((a) => a.id === f.activity)
    const r = {
      ref: `POD-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      activity: act.title,
      date: f.date,
      slot: f.slot,
      people: n,
      name: f.name.trim(),
    }
    const next = [...loadRes(), r]
    saveRes(next)
    setList(next)
    setDone(r)
    setF({ ...emptyBooking, activity: initialActivity })
  }

  const cancel = (ref) => {
    if (!window.confirm(`Annuler la réservation ${ref} ?`)) return
    const next = loadRes().filter((r) => r.ref !== ref)
    saveRes(next)
    setList(next)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <Field label="Activité" error={err.activity}>
        <select value={f.activity} onChange={set('activity')} className={`${inputCls} cursor-pointer appearance-none`}>
          <option value="" className="bg-abyss">Choisir une activité</option>
          {BOOKABLE.map((a) => (
            <option key={a.id} value={a.id} className="bg-abyss">
              {a.title}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Date" error={err.date}>
          <input type="date" value={f.date} min={bounds.min} max={bounds.max} onChange={set('date')} className={inputCls} />
        </Field>
        <Field label="Personnes" error={err.people}>
          <input type="number" min="1" max="20" value={f.people} onChange={set('people')} className={inputCls} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-foam/45">Créneau</legend>
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <label key={s} className="relative cursor-pointer">
              <input type="radio" name="slot" value={s} checked={f.slot === s} onChange={set('slot')} className="peer sr-only" />
              <span className="block border border-foam/15 px-4 py-2 font-mono text-xs tracking-wider text-foam/70 transition-colors peer-checked:border-tide peer-checked:bg-tide peer-checked:text-abyss peer-focus-visible:ring-1 peer-focus-visible:ring-tide hover:border-tide/60">
                {s.replace(':', 'h')}
              </span>
            </label>
          ))}
        </div>
        {err.slot && <span className="mt-1 block font-mono text-[10px] tracking-wider text-coral">{err.slot}</span>}
      </fieldset>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Nom complet" error={err.name}>
          <input type="text" autoComplete="name" value={f.name} onChange={set('name')} className={inputCls} />
        </Field>
        <Field label="Téléphone" error={err.phone}>
          <input type="tel" autoComplete="tel" placeholder="77 123 45 67" value={f.phone} onChange={set('phone')} className={inputCls} />
        </Field>
      </div>

      <Field label="E-mail (facultatif)" error={err.email}>
        <input type="email" autoComplete="email" value={f.email} onChange={set('email')} className={inputCls} />
      </Field>

      <Submit>Confirmer la réservation</Submit>

      {done && (
        <Notice>
          {DEMO ? 'Exemple de confirmation' : 'Réservation enregistrée'} — numéro <b className="font-mono text-tide">{done.ref}</b>
          <br />
          {done.activity} · {fmtDate(done.date)} à {done.slot.replace(':', 'h')} · {done.people} pers.
          <br />
          <span className="text-foam/60">
            {DEMO ? 'Démonstration : aucune réservation n’est transmise à l’établissement.' : (
              <>Présentez ce numéro à l’accueil. Une question : <a className="underline" href={PHONE.href}>{PHONE.display}</a></>
            )}
          </span>
        </Notice>
      )}

      {list.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-foam/45">{DEMO ? 'Mes réservations (démo)' : 'Mes réservations'}</p>
          <ul>
            {list.map((r) => (
              <li key={r.ref} className="flex items-center justify-between gap-4 border-t border-foam/10 py-3 text-sm">
                <span>
                  <span className="font-mono text-tide">{r.ref}</span> · {r.activity}
                  <span className="block text-xs text-foam/50">
                    {fmtDate(r.date)} à {r.slot.replace(':', 'h')} · {r.people} pers.
                  </span>
                </span>
                <button type="button" onClick={() => cancel(r.ref)} className="font-mono text-[10px] uppercase tracking-widest text-coral hover:underline">
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}

const emptyMessage = { name: '', reply: '', subject: 'Renseignements / tarifs', message: '' }
const SUBJECTS = ['Renseignements / tarifs', 'Demande de réservation', 'Cours de natation', 'Abonnement fitness / musculation', 'Location d’un terrain', 'Organisation d’une compétition', 'Autre']

// Formule vitrine : pas de réservation en ligne, une demande pré-remplie à envoyer au secrétariat
const bookingRequest = (id) => {
  const act = BOOKABLE.find((a) => a.id === id)
  return act
    ? { ...emptyMessage, subject: 'Demande de réservation', message: `Bonjour, je souhaite réserver : ${act.title}.\nDate et heure souhaitées : ` }
    : emptyMessage
}

function MessageForm({ initialActivity = '' }) {
  const [f, setF] = useState(() => bookingRequest(initialActivity))
  const [err, setErr] = useState({})
  const [sentTo, setSentTo] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  useEffect(() => {
    const pick = (e) => setF((s) => ({ ...bookingRequest(e.detail), name: s.name, reply: s.reply }))
    window.addEventListener('pod:book', pick)
    return () => window.removeEventListener('pod:book', pick)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const r = f.reply.trim()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'Indiquez votre nom.'
    if (!(phoneOk(r) || (r.includes('@') && emailOk(r)))) er.reply = 'Téléphone ou e-mail valide requis.'
    if (f.message.trim().length < 10) er.message = 'Votre message est trop court.'
    setErr(er)
    if (Object.keys(er).length) return
    setSentTo(f.name.trim())
    setF(emptyMessage)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Nom" error={err.name}>
          <input type="text" autoComplete="name" value={f.name} onChange={set('name')} className={inputCls} />
        </Field>
        <Field label="Téléphone ou e-mail" error={err.reply}>
          <input type="text" value={f.reply} onChange={set('reply')} className={inputCls} />
        </Field>
      </div>
      <Field label="Sujet">
        <select value={f.subject} onChange={set('subject')} className={`${inputCls} cursor-pointer appearance-none`}>
          {SUBJECTS.map((s) => (
            <option key={s} className="bg-abyss">
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Message" error={err.message}>
        <textarea rows={4} value={f.message} onChange={set('message')} className={`${inputCls} resize-none`} />
      </Field>
      <Submit>Envoyer le message</Submit>
      {sentTo && (
        <Notice>
          {DEMO
            ? `Merci ${sentTo}. Sur le site final, votre message serait envoyé au secrétariat, qui vous recontacterait.`
            : `Merci ${sentTo}, votre message a bien été pris en compte. L’accueil vous recontacte rapidement.`}
        </Notice>
      )}
    </form>
  )
}

export default function ContactPanel({ initialActivity = '' }) {
  const vitrine = useFormule() === 'vitrine'
  const [tab, setTab] = useState('booking')
  useEffect(() => {
    const show = () => setTab('booking')
    window.addEventListener('pod:book', show)
    return () => window.removeEventListener('pod:book', show)
  }, [])

  if (vitrine) {
    return (
      <div className="relative border border-foam/10 bg-abyss/65 p-6 backdrop-blur-xl md:p-10">
        <p className="mb-9 border-b border-foam/10 pb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-foam">
          Nous écrire · demande de réservation
        </p>
        <MessageForm initialActivity={initialActivity} />
      </div>
    )
  }

  const tabs = [
    ['booking', 'Réserver'],
    ['message', 'Écrire'],
  ]
  return (
    <div className="relative border border-foam/10 bg-abyss/65 p-6 backdrop-blur-xl md:p-10">
      <div role="tablist" className="mb-9 flex gap-8 border-b border-foam/10 font-mono text-[11px] uppercase tracking-[0.3em]">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`relative -mb-px pb-4 transition-colors ${tab === id ? 'text-foam' : 'text-foam/40 hover:text-foam/70'}`}
          >
            {label}
            <span className={`absolute bottom-0 left-0 h-px bg-tide transition-all duration-500 ${tab === id ? 'w-full' : 'w-0'}`} />
          </button>
        ))}
      </div>
      {tab === 'booking' ? <BookingForm initialActivity={initialActivity} /> : <MessageForm />}
    </div>
  )
}
