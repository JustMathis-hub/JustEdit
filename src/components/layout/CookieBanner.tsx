'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export function CookieBanner() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('justedit-cookies');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('justedit-cookies', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('justedit-cookies', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-[oklch(0.13_0_0)] border border-[oklch(0.22_0_0)] rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3 mb-3">
          <Cookie size={18} className="text-[#8b1a1a] mt-0.5 shrink-0" />
          <p className="text-sm text-[oklch(0.7_0.005_0)] leading-relaxed">
            {t('message')}{' '}
            <Link
              href="/politique-de-confidentialite"
              className="text-[#8b1a1a] hover:text-[#c0392b] underline"
            >
              {t('learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 text-xs"
          >
            {t('accept')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecline}
            className="flex-1 border-[oklch(0.25_0_0)] text-[oklch(0.6_0.005_0)] hover:text-white text-xs"
          >
            {t('decline')}
          </Button>
        </div>
      </div>
    </div>
  );
}
