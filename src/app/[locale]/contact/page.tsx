'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]';

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">{t('section')}</p>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('title')}</h1>
          <p className="text-[oklch(0.5_0.005_0)] mt-2">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Mail size={16} className="text-[#8b1a1a]" />
                <span className="text-white font-semibold text-sm">Email</span>
              </div>
              <p className="text-xs text-[oklch(0.5_0.005_0)]">justmathis.contact@gmail.com</p>
            </div>
            <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Clock size={16} className="text-[#8b1a1a]" />
                <span className="text-white font-semibold text-sm">{t('responseTime')}</span>
              </div>
              <p className="text-xs text-[oklch(0.5_0.005_0)]">{t('responseDelay')}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.3)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={24} className="text-[#8b1a1a]" />
                </div>
                <p className="text-white font-bold text-lg mb-2">{t('successTitle')}</p>
                <p className="text-sm text-[oklch(0.5_0.005_0)]">{t('success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-[oklch(0.7_0.005_0)]">{t('name')}</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      className={inputClass}
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-[oklch(0.7_0.005_0)]">{t('email')}</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      className={inputClass}
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-[oklch(0.7_0.005_0)]">{t('subject')}</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder={t('subjectPlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-[oklch(0.7_0.005_0)]">{t('message')}</Label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    required
                    rows={5}
                    className={`w-full px-3 py-2 rounded-md text-sm resize-none ${inputClass}`}
                    placeholder={t('messagePlaceholder')}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-semibold"
                >
                  {loading ? <Loader2 size={15} className="animate-spin mr-2" /> : <Send size={15} className="mr-2" />}
                  {t('submit')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
