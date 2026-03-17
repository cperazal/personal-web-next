'use client'

import { useRef, useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Github, Linkedin, Facebook, Twitter, Send } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SectionWrapper from '@/components/ui/SectionWrapper'
import type { PersonalInfo } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getPersonalInfo } from '@/lib/contentful'

interface ContactProps {
  initialData: PersonalInfo[]
}

const SOCIAL_LINKS = [
  { key: 'github', Icon: Github, field: 'github' as const },
  { key: 'linkedin', Icon: Linkedin, field: 'linkedin' as const },
  { key: 'facebook', Icon: Facebook, field: 'facebook' as const },
  { key: 'twitter', Icon: Twitter, field: 'twitter' as const },
]

export default function Contact({ initialData }: ContactProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getPersonalInfo(locale).then(setData)
  }, [locale])

  const person = data[0]

  const labels = {
    'en-US': {
      section: '08 / Contact',
      heading: 'Get in',
      headingAccent: 'touch',
      subtitle: "I'm open to new opportunities. Whether you have a question or just want to say hi, fill out the form and I'll reply promptly.",
      nameLabel: 'Name',
      emailLabel: 'Email',
      subjectLabel: 'Subject',
      messageLabel: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      success: 'Message sent successfully!',
      error: 'An error occurred, please try again.',
    },
    'es-419': {
      section: '08 / Contacto',
      heading: 'Ponerse en',
      headingAccent: 'contacto',
      subtitle: 'Estoy abierto a nuevas oportunidades. Si tienes una pregunta o simplemente quieres saludar, completa el formulario y te responderé pronto.',
      nameLabel: 'Nombre',
      emailLabel: 'Correo',
      subjectLabel: 'Asunto',
      messageLabel: 'Mensaje',
      send: 'Enviar mensaje',
      sending: 'Enviando…',
      success: '¡Mensaje enviado con éxito!',
      error: 'Ha ocurrido un error, por favor vuelve a intentarlo.',
    },
  } as const

  const t = labels[locale]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(t.success)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error(t.error)
    } finally {
      setSending(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'var(--font-sans)',
  } as const

  return (
    <SectionWrapper id="contact">
      <div className="container-section">
        {/* Heading */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
            {t.section}
          </p>
          <h2 className="section-heading">
            {t.heading} <span>{t.headingAccent}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
          {/* Left — contact info */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t.subtitle}
            </p>

            {person && (
              <div className="flex flex-col gap-3">
                {person.correo && (
                  <a
                    href={`mailto:${person.correo}`}
                    className="flex items-center gap-3 text-sm group"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <Mail size={15} style={{ color: 'var(--accent)' }} />
                    </span>
                    <span className="group-hover:underline">{person.correo}</span>
                  </a>
                )}
                {person.telefono && (
                  <a
                    href={`tel:${person.telefono}`}
                    className="flex items-center gap-3 text-sm group"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <Phone size={15} style={{ color: 'var(--accent)' }} />
                    </span>
                    <span className="group-hover:underline">{person.telefono}</span>
                  </a>
                )}
                {person.ubicacion && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <MapPin size={15} style={{ color: 'var(--accent)' }} />
                    </span>
                    {person.ubicacion}
                  </div>
                )}
              </div>
            )}

            {/* Social links */}
            {person && (
              <div className="flex items-center gap-2.5 pt-2">
                {SOCIAL_LINKS.map(({ key, Icon, field }) => {
                  const href = person[field as keyof PersonalInfo] as string | null
                  if (!href) return null
                  return (
                    <motion.a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={key}
                      className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                      whileHover={{
                        scale: 1.1,
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={16} />
                    </motion.a>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Right — form */}
          <motion.form
            onSubmit={handleSubmit}
            className="glass-card flex flex-col gap-6"
            style={{ padding: '2.5rem' }}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            noValidate
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px var(--glow)' }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.boxShadow = 'none' }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px var(--glow)' }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                {t.subjectLabel}
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder={locale === 'es-419' ? 'Consulta sobre...' : 'Regarding...'}
                style={inputStyle}
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px var(--glow)' }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.boxShadow = 'none' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                {t.messageLabel}
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder={locale === 'es-419' ? 'Tu mensaje aquí...' : 'Your message here...'}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px var(--glow)' }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.boxShadow = 'none' }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={sending}
              className="btn-accent w-full justify-center"
              style={{ opacity: sending ? 0.7 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              {sending ? t.sending : t.send}
              {!sending && <Send size={15} />}
            </motion.button>
          </motion.form>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        theme="dark"
        toastStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
    </SectionWrapper>
  )
}
