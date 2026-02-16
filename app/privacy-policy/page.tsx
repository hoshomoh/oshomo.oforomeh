import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/header';
import { SiteFooter } from '@/components/site-footer';
import type { WithContext, Article } from 'schema-dts';

import { CONTACT_EMAIL, PRIVACY_POLICY_URL, PUBLIC_URL } from '@/lib/constant';

export const metadata: Metadata = {
  title: 'Privacy Policy | Oshomo Oforomeh',
  description:
    'Privacy Policy for all apps by Oshomo Oforomeh, including Expense-Wise and Citizenship Test App. Learn how your data is collected, used, and protected.',
  openGraph: {
    title: 'Privacy Policy | Oshomo Oforomeh',
    description:
      'Covers data usage, collection, and security for Expense-Wise, Citizenship Test App, and other apps.',
    url: PRIVACY_POLICY_URL,
    siteName: 'Oshomo Oforomeh',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Oshomo Oforomeh',
    description:
      'Covers data usage, collection, and security for Expense-Wise, Citizenship Test App, and other apps.',
  },
};

const jsonLd: WithContext<Article> = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${PRIVACY_POLICY_URL}#article`,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${PRIVACY_POLICY_URL}#webpage`,
  },
  headline: 'Privacy Policy',
  name: 'Privacy Policy | Oshomo Oforomeh',
  description:
    'Privacy Policy for all apps by Oshomo Oforomeh, including Expense-Wise and Citizenship Test App. Learn how your data is collected, used, and protected.',
  url: PRIVACY_POLICY_URL,
  inLanguage: 'en',
  dateModified: '2025-09-05',
  datePublished: '2025-09-05',
  author: {
    '@type': 'Person',
    '@id': `${PUBLIC_URL}/#person`,
    name: 'Oshomo Oforomeh',
    url: PUBLIC_URL,
  },
  publisher: {
    '@type': 'Organization',
    '@id': `${PUBLIC_URL}/#organization`,
    name: 'Oshomo Oforomeh',
    url: PUBLIC_URL,
  },
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${PUBLIC_URL}/#website`,
    name: 'Oshomo Oforomeh',
    url: PUBLIC_URL,
  },
  about: [
    {
      '@type': 'Thing',
      name: 'Privacy Policy',
    },
    {
      '@type': 'Thing',
      name: 'Data protection',
    },
  ],
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full flex-1 font-mono flex p-8">
        <div className="flex flex-col gap-12 w-[24rem] text-left">
          <Header items={[{ label: 'privacy policy', href: '/privacy-policy', current: true }]} />

          {/* Page Title */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">privacy policy</h2>
            <p className="text-sm font-medium text-balance">Last updated: September 5, 2025</p>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 text-sm leading-6">
            <p className="text-sm font-medium">
              This Privacy Policy describes how Oshomo Oforomeh (“we”, “our”, or “us”) collects,
              uses, and protects your information when you use any of our applications, including{' '}
              <strong>Expense-Wise</strong>, <strong>Citizenship Test App</strong>, and any other
              apps we may publish (collectively, the “Apps”).
            </p>
            <p className="text-sm font-medium">
              By downloading, installing, or using our Apps, you agree to this Privacy Policy. If
              you do not agree, please do not use the Apps.
            </p>

            <div>
              <h2 className="font-semibold mb-2">1. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm font-medium">
                <li>
                  <strong>Account Information:</strong> Such as your name, email address, or login
                  credentials (if an app requires an account).
                </li>
                <li>
                  <strong>User-Generated Content:</strong> Any information you choose to input into
                  the app, such as notes, answers, preferences, or financial records (depending on
                  the app’s purpose).
                </li>
                <li>
                  <strong>Support Requests:</strong> Details you provide when you contact us for
                  help, including your email and message content
                </li>
                <li>
                  <strong>Automatically Collected Info:</strong> Device data, usage analytics, and
                  crash logs.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-2">2. How We Use Your Information</h2>
              <p className="text-sm font-medium">
                We use your information to provide, improve, and secure our apps, personalize your
                experience, respond to support, and send updates (if opted in). We do not sell your
                data.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">3. Data Storage & Security</h2>
              <p className="text-sm font-medium">
                Your data may be stored locally or securely in the cloud. We apply reasonable
                measures to protect it, but you are responsible for securing your credentials.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">4. Data Deletion</h2>
              <p className="text-sm font-medium">
                You can delete your data and account anytime via in-app settings or by emailing{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">5. Children’s Privacy</h2>
              <p className="text-sm font-medium">
                Our Apps are not directed to children under 13. We do not knowingly collect data
                from children. If a child has provided information, contact us for deletion.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">6. Third-Party Services</h2>
              <p className="text-sm font-medium">
                Some apps may use third-party services (Google Play Services, Apple App Store
                Services, Firebase) which collect data per their own policies.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">7. International Users</h2>
              <p className="text-sm font-medium">
                Your data may be transferred to and processed in countries outside your own.
                Protections may differ depending on jurisdiction.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">8. Your Rights</h2>
              <p className="text-sm font-medium">
                You may have rights under GDPR or other laws (access, correction, deletion,
                withdrawal of consent). Contact us to exercise your rights.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">9. Changes to This Policy</h2>
              <p className="text-sm font-medium">
                We may update this Privacy Policy from time to time. We will notify you by updating
                the “Last Updated” date or via in-app notice.
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">10. Contact Us</h2>
              <p className="text-sm font-medium">
                Oshomo Oforomeh <br />
                Email:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter className="mt-8" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
