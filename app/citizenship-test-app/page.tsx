import React from 'react';
import type { Metadata } from 'next';
import type { WithContext, WebPage, SoftwareApplication } from 'schema-dts';
import {
  BookOpen,
  ClipboardCheck,
  BrainCircuit,
  LineChart,
  WifiOff,
  Globe,
  LayoutDashboard,
} from 'lucide-react';

import { AppDetails } from '@/components/app-details';
import { SiteFooter } from '@/components/site-footer';
import { CITIZENSHIP_TEST_APP_URL, PUBLIC_URL } from '@/lib/constant';

const features = [
  {
    label: 'Official Questions',
    description:
      'Practice with real questions from the German Einbürgerungstest, including state-specific ones.',
    icon: BookOpen,
  },
  {
    label: 'Mock Exams',
    description: 'Simulate the actual test experience with timed, randomized mock exams.',
    icon: ClipboardCheck,
  },
  {
    label: 'Smart Study Modes',
    description: 'Learn by category, difficulty, or past mistakes to maximize retention.',
    icon: BrainCircuit,
  },
  {
    label: 'Progress Tracking',
    description: 'View your strengths, weaknesses, and improvement over time with visual insights.',
    icon: LineChart,
  },
  {
    label: 'Offline Access',
    description: 'Download content and study anytime, even without an internet connection.',
    icon: WifiOff,
  },
  {
    label: 'Global Expansion',
    description: 'Built to support citizenship tests for multiple countries — more coming soon.',
    icon: Globe,
  },
  {
    label: 'Simple & Clean Interface',
    description: 'Designed for ease of use with a distraction-free experience.',
    icon: LayoutDashboard,
  },
];
const screenshots = [
  {
    src: '/images/germany-citizenship-test/screenshots/1.png',
    alt: 'Welcome to Citizenship Test App',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/2.png',
    alt: 'Pick a test to practice from the home screen',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/3.png',
    alt: 'See all your test results and progress in one place',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/4.png',
    alt: 'Start other quizzes related to the test you are practicing',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/5.png',
    alt: 'Question screen with options to choose from',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/6.png',
    alt: 'Change question language directly from the question screen',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/7.png',
    alt: 'See question in original language and translated language',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/8.png',
    alt: 'See instant feedback after answering a question',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/9.png',
    alt: 'See curated statistics after completing a quiz',
  },
  {
    src: '/images/germany-citizenship-test/screenshots/10.png',
    alt: 'Reset questions related to a statistic to practice them again',
  },
];
const installUrls: Record<'appStore' | 'playStore', string> = {
  appStore: 'https://apps.apple.com/de/app/citizenship-test-prep/id6749445598',
  playStore: 'https://play.google.com/store/apps/details?id=com.citizenshiptestapp',
};
const data = {
  name: 'Citizenship Test App',
  description: `Taking the next step toward citizenship? Whether you’re preparing for the 
      German Einbürgerungstest or future tests in other countries, our app is designed to 
      help you succeed with confidence.`,
};

export const metadata: Metadata = {
  title: 'Citizenship Test App | Oshomo Oforomeh',
  description:
    'Prepare for your citizenship test with practice questions, study guides, and progress tracking.',
  openGraph: {
    title: 'Citizenship Test App | Oshomo Oforomeh',
    description:
      'Your companion for preparing for the citizenship test. Practice, review, and succeed.',
    url: CITIZENSHIP_TEST_APP_URL,
    siteName: 'Oshomo Oforomeh',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citizenship Test App | Oshomo Oforomeh',
    description:
      'Your companion for preparing for the citizenship test. Practice, review, and succeed.',
  },
  icons: {
    icon: '/icons/citizenship-test-app.favicon.ico',
  },
  other: {
    'apple-itunes-app': 'app-id=6749445598',
  },
};

const jsonLd: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${CITIZENSHIP_TEST_APP_URL}#webpage`,
  url: CITIZENSHIP_TEST_APP_URL,
  name: 'Citizenship Test App | Oshomo Oforomeh',
  description:
    'Prepare for your citizenship test with practice questions, study guides, and progress tracking.',
  inLanguage: 'en',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${PUBLIC_URL}/#website`,
    name: 'Oshomo Oforomeh',
    url: PUBLIC_URL,
  },
  about: {
    '@type': 'SoftwareApplication',
    '@id': `${CITIZENSHIP_TEST_APP_URL}#app`,
    mainEntityOfPage: { '@id': `${CITIZENSHIP_TEST_APP_URL}#webpage` },
    name: data.name,
    description: data.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: ['iOS', 'Android'],
    url: CITIZENSHIP_TEST_APP_URL,
    installUrl: [installUrls.appStore, installUrls.playStore],
    author: {
      '@type': 'Person',
      '@id': `${PUBLIC_URL}/#person`,
      name: 'Oshomo Oforomeh',
      url: PUBLIC_URL,
    },
    offers: Object.keys(installUrls).map((platform) => ({
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'EUR',
      category: 'free',
      url: installUrls[platform as 'appStore' | 'playStore'],
    })),
    featureList: features.map((feature) => feature.label),
    screenshot: screenshots.map((screenshot) => `${PUBLIC_URL}/${screenshot}`),
  } as SoftwareApplication,
};

export default function ExpenseWisePage() {
  return (
    <>
      <AppDetails
        url="/expense-wise"
        features={features}
        screenshots={screenshots}
        name={data.name}
        description={data.description}
        links={installUrls}
      />
      <SiteFooter className="mt-8" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
