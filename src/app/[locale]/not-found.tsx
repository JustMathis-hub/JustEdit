import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-[#8b1a1a] mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-[oklch(0.5_0.005_0)] mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0">
            <ArrowLeft size={16} className="mr-2" />
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
