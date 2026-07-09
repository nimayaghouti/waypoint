import {
  GitHubLogoIcon as Github,
  InstagramLogoIcon as Instagram,
  LinkedInLogoIcon as LinkedIn,
  TwitterLogoIcon as Twitter,
} from '@radix-ui/react-icons';

import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';

export async function Footer() {
  const t = await getTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/90">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/icon.svg"
                alt="Waypoint logo"
                className="size-10 drop-shadow-sm"
                width={40}
                height={40}
              />
              <span className="font-bold text-xl text-primary">Waypoint</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              {t('description')}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/trips"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('trips')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('about')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t('followUs')}</h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} {t('copyright')}
          </p>
          <p className="flex flex-wrap items-center justify-center gap-1.5">
            {t('developedWith')}{' '}
            <span className="text-red-500 animate-pulse">❤️</span> {t('by')}
            <a
              href="https://www.linkedin.com/in/nima-yaghouti"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-1 font-semibold text-foreground hover:text-primary transition-colors"
            >
              Nima Yaghouti
              <LinkedIn className="size-4" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
