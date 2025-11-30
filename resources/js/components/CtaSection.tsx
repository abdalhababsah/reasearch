import React from 'react';
import { motion } from 'framer-motion';
import { register } from '@/routes';
import { useTranslation } from '@/i18n';
import { Link } from '@inertiajs/react';
import { ArrowRight, Compass } from 'lucide-react';

function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-primary py-24 text-white">
      <div className="absolute inset-0">
        <img
          src="/photo-section.jpeg"
          alt="Background"
          className="h-full w-full object-cover opacity-10"
      />
    </div>

    <div className="container relative z-10 mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl"
      >
        <h2 className="mb-6 text-5xl font-bold">
          {t('cta.heading', { defaultValue: 'Start Your Research Journey' })}
        </h2>
        <p className="mb-8 text-xl opacity-90">
          {t('cta.subheading', {
            defaultValue:
              'Join thousands of researchers discovering, publishing, and sharing groundbreaking work.'
          })}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={register()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary shadow-2xl transition-all"
            >
              {t('actions.getStarted', { defaultValue: 'Get Started Free' })}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/researches"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-lg font-semibold transition-all hover:bg-white/10"
            >
              <Compass className="h-5 w-5" />
              {t('cta.browseResearch', { defaultValue: 'Browse Research' })}
            </Link>
          </motion.div>
        </div>

        <p className="mt-6 text-sm opacity-75">
          {t('cta.note', {
            defaultValue: 'No credit card required • Explore 45,000+ papers • Join in 60 seconds'
          })}
        </p>
      </motion.div>
    </div>
  </section>
  )
}

export default CtaSection
