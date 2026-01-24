import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { WithContext, AboutPage as AboutPageSchema } from 'schema-dts';

import Header from '@/components/header';
import {
  CITIZENSHIP_TEST_APP_URL,
  EXPENSE_WISE_URL,
  PUBLIC_URL,
  TRIPZAPP_URL,
} from '@/lib/constant';

const apps: Record<
  string,
  {
    name: string;
    url: string;
    relative: string | null;
    blank: boolean;
    description: string;
  }
> = {
  expenseWise: {
    name: 'Expense Wise',
    url: EXPENSE_WISE_URL,
    relative: '/expense-wise',
    blank: false,
    description: 'A simple tool to manage expenses wisely and stay on top of your finances.',
  },
  citizenshipTestApp: {
    name: 'Citizenship Test App',
    url: CITIZENSHIP_TEST_APP_URL,
    relative: '/citizenship-test-app',
    blank: false,
    description:
      'An app designed to help users prepare effectively for their citizenship test with practice questions and study guides.',
  },
  tripzapp: {
    name: 'TripZapp',
    url: TRIPZAPP_URL,
    relative: null,
    blank: true,
    description: `Discover unique things to do in Africa, from safaris to cultural tours, all hosted
                  by local experts on TripZapp, the trusted way to book authentic African
                  experiences.`,
  },
};
const socialLinks = {
  linkedin: 'https://linkedin.com/in/hoshomoh/',
  github: 'https://github.com/hoshomoh',
};

export const metadata: Metadata = {
  title: 'About | Oshomo Oforomeh',
  description:
    'Learn more about Oshomo Oforomeh, Staff Software Engineer with an MSc in Computer Science. Experienced across backend, frontend, and fullstack roles.',
  openGraph: {
    title: 'About | Oshomo Oforomeh',
    description:
      'Staff Software Engineer with MSc in Computer Science, bridging engineering and product thinking.',
    url: PUBLIC_URL,
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

const jsonLd: WithContext<AboutPageSchema> = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${PUBLIC_URL}#aboutpage`,
  url: PUBLIC_URL,
  name: 'About | Oshomo Oforomeh',
  description:
    'Learn more about Oshomo Oforomeh, Staff Software Engineer with an MSc in Computer Science. Experienced across backend, frontend, and fullstack roles.',
  inLanguage: 'en',
  mainEntity: {
    '@type': 'Person',
    '@id': `${PUBLIC_URL}/#person`,
    name: 'Oshomo Oforomeh',
    jobTitle: 'Staff Software Engineer',
    description:
      'Staff Software Engineer with an MSc in Computer Science. Experienced across backend, frontend, and full-stack roles, bridging engineering and product thinking.',
    url: PUBLIC_URL,
    sameAs: [socialLinks.linkedin, socialLinks.github],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        educationalLevel: "Master's",
        name: 'MSc in Computer Science',
      },
    ],
    knowsAbout: [
      'Backend engineering',
      'Frontend engineering',
      'Full-stack development',
      'Payments',
      'E-commerce',
      'Logistics',
      'Travel technology',
      'Taxes',
      'Accounting',
      'Marketing technology',
      'System reliability',
      'Engineering mentorship',
      'Product thinking',
    ],
    subjectOf: [
      {
        '@type': 'SoftwareApplication',
        '@id': `${apps.expenseWise.url}#project`,
        name: apps.expenseWise.name,
        url: apps.expenseWise.url,
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['iOS', 'Android'],
        description: apps.expenseWise.description,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${apps.citizenshipTestApp.url}#project`,
        name: apps.citizenshipTestApp.name,
        url: apps.citizenshipTestApp.url,
        applicationCategory: 'EducationalApplication',
        operatingSystem: ['iOS', 'Android'],
        description: apps.citizenshipTestApp.description,
      },
      {
        '@type': 'WebSite',
        '@id': `${apps.tripzapp.url}/#website`,
        name: apps.tripzapp.name,
        url: apps.tripzapp.url,
        description: apps.tripzapp.description,
      },
    ],
  },
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${PUBLIC_URL}/#website`,
    name: 'Oshomo Oforomeh',
    url: PUBLIC_URL,
  },
};

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full flex-1 font-mono flex p-8">
        <div className="flex flex-col gap-12 w-[24rem] text-left">
          <Header
            items={[
              { label: 'linkedin', href: socialLinks.linkedin, external: true },
              { label: 'github', href: socialLinks.github, external: true },
            ]}
          />
          {/* About Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">about me</h2>
            <div className="text-sm font-medium text-balance space-y-4">
              <p>
                My name is <em>Oshomo Oforomeh</em>, a Staff Software Engineer with an MSc in
                Computer Science. Over the years, I’ve worked across backend, frontend, and
                full‑stack roles, delivering solutions in payments, e‑commerce, logistics, travel,
                taxes, accounting and marketing tech.
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
              {Object.keys(apps).map((key) => {
                return (
                  <Link
                    key={key}
                    {...(apps[key].blank ? { target: '_blank' } : {})}
                    href={apps[key].relative ? apps[key].relative : apps[key].url}
                    className="no-underline flex flex-col gap-2"
                  >
                    <span className="underline text-[0.9rem]">{apps[key].name}</span>
                    <p className="text-foreground text-[0.9rem]">{apps[key].description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
