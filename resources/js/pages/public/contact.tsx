import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Clock, MessageCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import CtaSection from '@/components/CtaSection';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Contact() {
  const { auth } = usePage<SharedData>().props;
  const { t } = useTranslation();
  const isAuthenticated = Boolean(auth.user);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('public.contact.submit'), {
      onSuccess: () => {
        setData({ name: '', email: '', subject: '', message: '' });
      },
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: t('contact.info.email', { defaultValue: 'Email Us' }),
      description: t('contact.info.emailDesc', { defaultValue: 'Get in touch via email' }),
      value: 'support@researchhub.com',
      link: 'mailto:support@researchhub.com',
      color: 'bg-primary'
    },
    {
      icon: Phone,
      title: t('contact.info.phone', { defaultValue: 'Call Us' }),
      description: t('contact.info.phoneDesc', { defaultValue: 'Mon-Fri from 9am to 6pm' }),
      value: '+1 (234) 567-890',
      link: 'tel:+1234567890',
      color: 'bg-primary'
    },
    {
      icon: MapPin,
      title: t('contact.info.address', { defaultValue: 'Visit Us' }),
      description: t('contact.info.addressDesc', { defaultValue: 'Come say hello' }),
      value: '123 Research Boulevard, Science City',
      link: '#',
      color: 'bg-primary'
    },
    {
      icon: Clock,
      title: t('contact.hours.title', { defaultValue: 'Office Hours' }),
      description: t('contact.hours.description', { defaultValue: 'Our working hours' }),
      value: t('contact.hours.value', { defaultValue: 'Mon-Fri: 9am - 6pm' }),
      link: '#',
      color: 'bg-primary'
    }
  ];

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={t('contact.title', { defaultValue: 'Contact Us' })}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('contact.badge', { defaultValue: "We're Here to Help" })}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-5xl font-bold lg:text-6xl xl:text-7xl"
            >
              {t('contact.heading', { defaultValue: 'Get in' })}{' '}

            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-xl text-muted-foreground lg:text-2xl"
            >
              {t('contact.subheading', {
                defaultValue:
                  'Have questions about publishing, collaboration, or need support? Our team is ready to assist you.',
              })}
            </motion.p>


          </motion.div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, i) => (
              <motion.a
                key={i}
                href={method.link}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl border-2 border-primary/10 bg-background p-8 transition-all hover:border-primary/30 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 transition-opacity group-hover:opacity-5`} />

                <div className="relative z-10 space-y-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${method.color} text-white shadow-lg`}
                  >
                    <method.icon className="h-8 w-8" />
                  </motion.div>

                  <div>
                    <h3 className="mb-2 text-xl font-bold">{method.title}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{method.description}</p>
                    <p className="font-semibold text-primary">{method.value}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-5">
              {/* Left: Form */}
              <div className="lg:col-span-3">
                <div className="overflow-hidden rounded-3xl border-2 border-primary/10 bg-background shadow-xl">
                  {/* Header */}
                  <div className="border-b bg-gradient-to-r from-primary/5 to-transparent p-8">
                    <h2 className="mb-2 text-3xl font-bold">{t('contact.form.title')}</h2>
                    <p className="text-muted-foreground">
                      {t('contact.form.description')}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                      {/* Name & Email Row */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-semibold">
                            {t('contact.form.name')} *
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('contact.form.namePlaceholder', { defaultValue: 'Your full name' })}
                            required
                            className="w-full rounded-xl border-2 border-primary/10 bg-background px-4 py-3 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold">
                            {t('contact.form.email')} *
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('contact.form.emailPlaceholder')}
                            required
                            className="w-full rounded-xl border-2 border-primary/10 bg-background px-4 py-3 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-semibold">
                          {t('contact.form.subject')} *
                        </label>
                        <input
                          id="subject"
                          type="text"
                          value={data.subject}
                          onChange={(e) => setData('subject', e.target.value)}
                          placeholder={t('contact.form.subjectPlaceholder')}
                          required
                          className="w-full rounded-xl border-2 border-primary/10 bg-background px-4 py-3 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-500">{errors.subject}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-semibold">
                          {t('contact.form.message')} *
                        </label>
                        <textarea
                          id="message"
                          value={data.message}
                          onChange={(e) => setData('message', e.target.value)}
                          placeholder={t('contact.form.messagePlaceholder')}
                          rows={6}
                          required
                          className="w-full rounded-xl border-2 border-primary/10 bg-background px-4 py-3 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                        />
                        {errors.message && (
                          <p className="text-sm text-red-500">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div>
                        <motion.button
                          type="submit"
                          disabled={processing}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed md:w-auto"
                        >
                          <Send className="h-5 w-5" />
                          {processing ? t('contact.form.sending', { defaultValue: 'Sending...' }) : t('contact.form.send')}
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right: Info Cards */}
              <div className="space-y-6 lg:col-span-2">
                {/* Quick Info Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-3xl border-2 border-primary/10 bg-background p-8 shadow-lg"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">
                      {t('contact.quick.title', { defaultValue: 'Quick Response' })}
                    </h3>
                  </div>
                  <p className="mb-4 text-muted-foreground">
                    {t('contact.quick.description', {
                      defaultValue: 'Our dedicated support team typically responds within 24 hours on business days.',
                    })}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-muted-foreground">
                        {t('contact.quick.weekdays', { defaultValue: 'Monday - Friday' })}
                      </span>
                      <span className="font-semibold">
                        {t('contact.quick.hours', { defaultValue: '9:00 AM - 6:00 PM' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t('contact.quick.weekend', { defaultValue: 'Saturday - Sunday' })}
                      </span>
                      <span className="font-semibold">
                        {t('contact.quick.closed', { defaultValue: 'Closed' })}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* FAQ Link Card */}
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-3xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-8 shadow-lg transition-all hover:border-primary/30"
                >
                  <div className="relative z-10">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">
                      {t('contact.faq.title', { defaultValue: 'Looking for Answers?' })}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {t('contact.faq.description', {
                        defaultValue:
                          'Check out our comprehensive FAQ section for quick solutions to common questions.',
                      })}
                    </p>

                    <a href="/faq"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3"
                    >
                      {t('contact.faq.cta', { defaultValue: 'Visit FAQ' })}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>

                {/* Location Card with Image */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-3xl border-2 border-primary/10 bg-background shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"
                      alt={t('contact.office.alt', { defaultValue: 'Office Location' })}
                      className="h-full w-full object-cover"
                    />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">
                    {t('contact.office.title', { defaultValue: 'Visit Our Office' })}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">
                      {t('contact.office.addressLine1', { defaultValue: '123 Discovery Boulevard' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('contact.office.addressLine2', { defaultValue: 'Science City, ST 12345' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('contact.office.addressLine3', { defaultValue: 'Dias Lab' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold">
                  {t('contact.map.heading', { defaultValue: 'Find Us Here' })}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {t('contact.map.subheading', {
                    defaultValue: 'Located in the heart of Science City',
                  })}
                </p>
              </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="overflow-hidden rounded-3xl border-2 border-primary/10 shadow-2xl"
            >
              <div className="relative h-96 w-full bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=600&fit=crop"
                  alt="Map Location"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold dark:text-primary">
                          {t('contact.map.title', { defaultValue: 'Dias Lab HQ' })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('contact.map.location', { defaultValue: 'Science City' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </HomeLayout>
  );
}
