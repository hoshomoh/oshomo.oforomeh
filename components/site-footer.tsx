import Link from 'next/link';

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={`border-t py-4 text-sm text-center text-muted-foreground ${className ?? ''}`}
    >
      <p>
        &copy; {new Date().getFullYear()} Oshomo Oforomeh. All rights reserved.{' '}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}
