import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

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

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={t('contact.title', { defaultValue: 'Contact Us' })}>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold">
                {t('contact.heading', { defaultValue: 'Get in Touch' })}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('contact.subheading', { 
                  defaultValue: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.' 
                })}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('contact.form.title', { defaultValue: 'Send us a Message' })}</CardTitle>
                    <CardDescription>
                      {t('contact.form.description', { defaultValue: 'Fill out the form below and we\'ll get back to you soon' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {t('contact.form.name', { defaultValue: 'Name' })} *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('contact.form.namePlaceholder', { defaultValue: 'Your name' })}
                            required
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">
                            {t('contact.form.email', { defaultValue: 'Email' })} *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('contact.form.emailPlaceholder', { defaultValue: 'your.email@example.com' })}
                            required
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">
                          {t('contact.form.subject', { defaultValue: 'Subject' })} *
                        </Label>
                        <Input
                          id="subject"
                          type="text"
                          value={data.subject}
                          onChange={(e) => setData('subject', e.target.value)}
                          placeholder={t('contact.form.subjectPlaceholder', { defaultValue: 'How can we help?' })}
                          required
                        />
                        {errors.subject && (
                          <p className="text-sm text-destructive">{errors.subject}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">
                          {t('contact.form.message', { defaultValue: 'Message' })} *
                        </Label>
                        <Textarea
                          id="message"
                          value={data.message}
                          onChange={(e) => setData('message', e.target.value)}
                          placeholder={t('contact.form.messagePlaceholder', { defaultValue: 'Tell us more about your inquiry...' })}
                          rows={6}
                          required
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive">{errors.message}</p>
                        )}
                      </div>

                      <Button type="submit" size="lg" disabled={processing} className="w-full md:w-auto">
                        <Send className="mr-2 h-4 w-4" />
                        {processing
                          ? t('contact.form.sending', { defaultValue: 'Sending...' })
                          : t('contact.form.send', { defaultValue: 'Send Message' })}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('contact.info.title', { defaultValue: 'Contact Information' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{t('contact.info.email', { defaultValue: 'Email' })}</div>
                        <a href="mailto:support@researchhub.com" className="text-sm text-muted-foreground hover:text-primary">
                          support@researchhub.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{t('contact.info.phone', { defaultValue: 'Phone' })}</div>
                        <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary">
                          +1 (234) 567-890
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{t('contact.info.address', { defaultValue: 'Address' })}</div>
                        <p className="text-sm text-muted-foreground">
                          123 Research Boulevard<br />
                          Science City, ST 12345<br />
                          United States
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('contact.hours.title', { defaultValue: 'Office Hours' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('contact.hours.weekdays', { defaultValue: 'Monday - Friday' })}</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('contact.hours.weekend', { defaultValue: 'Saturday - Sunday' })}</span>
                      <span className="font-medium">{t('contact.hours.closed', { defaultValue: 'Closed' })}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
