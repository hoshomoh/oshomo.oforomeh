import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Oshomo Oforomeh',
  description:
    'Learn more about Oshomo Oforomeh, Staff Software Engineer with an MSc in Computer Science. Experienced across backend, frontend, and fullstack roles.',
  openGraph: {
    title: 'About | Oshomo Oforomeh',
    description:
      'Staff Software Engineer with MSc in Computer Science, bridging engineering and product thinking.',
    url: 'https://oshomo.oforomeh.com/about',
    siteName: 'Oshomo Oforomeh',
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: 'About | Oshomo Oforomeh',
    description:
      'Staff Software Engineer with MSc in Computer Science, bridging engineering and product thinking.',
  },
};

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full flex-1 font-mono flex p-8">
        <div className="flex flex-col gap-12 w-[24rem] text-left">
          {/* Top links */}
          <div className="flex items-center gap-2 font-medium">
            <Link className="flex items-center gap-2" href="/">
              oshomo
            </Link>{' '}
            /{/* */}
            <Link href="https://linkedin.com/in/hoshomoh/" target="_blank" rel="noreferrer">
              linkedin
            </Link>{' '}
            /{/* */}
            <Link href="https://github.com/hoshomoh" target="_blank" rel="noreferrer">
              github
            </Link>
          </div>

          {/* About Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">about me</h2>
            <div className="text-sm font-medium text-balance space-y-4">
              <p>
                My name is <em>Oshomo Oforomeh</em>, a Staff Software Engineer with an MSc in
                Computer Science. Over the years, I’ve worked across backend, frontend, and
                full‑stack roles, delivering solutions in payments, e‑commerce, logistics, and
                travel.
              </p>
              <p>
                I enjoy bridging the gap between engineering and product thinking. My focus is on
                building reliable systems, mentoring other engineers, and ensuring technology
                decisions align with delivering real value to people.
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">projects</h2>
            <div className="flex flex-col gap-6 text-sm font-medium">
              <a
                target="_blank"
                rel="noreferrer"
                href="/expense-wise"
                className="no-underline flex flex-col gap-2"
              >
                <span className="underline">expense-Wise</span>
                <p className="text-foreground text-[0.9rem]">
                  A simple tool to manage expenses wisely and stay on top of your finances.
                </p>
              </a>

              <a
                target="_blank"
                rel="noreferrer"
                href="/citizenship-test-app"
                className="no-underline flex flex-col gap-2"
              >
                <span className="underline">citizenship test app</span>
                <p className="text-foreground text-[0.9rem]">
                  An app designed to help users prepare effectively for their citizenship test with
                  practice questions and study guides.
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
