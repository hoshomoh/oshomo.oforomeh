import React from 'react';
import type { Metadata } from 'next';
import type { WithContext, WebPage, SoftwareApplication, FAQPage } from 'schema-dts';
import { Wallet, PlusCircle, Layers, BarChart3, Trash2, Moon, Languages } from 'lucide-react';

import { AppDetails } from '@/components/app-details';
import { SiteFooter } from '@/components/site-footer';
import { EXPENSE_WISE_URL, PUBLIC_URL } from '@/lib/constant';

const features = [
  {
    label: 'Curated Categories',
    description: 'View all your expenses neatly organized across carefully curated categories.',
    icon: Layers,
  },
  {
    label: 'Flexible Transactions',
    description: 'Add expenses, incomes, or transfers with just a few taps.',
    icon: PlusCircle,
  },
  {
    label: 'Account Management',
    description: 'Manage all your accounts in one place for a complete financial overview.',
    icon: Wallet,
  },
  {
    label: 'Deep Insights',
    description: 'Dive deeper into each category to understand your spending habits better.',
    icon: BarChart3,
  },
  {
    label: 'Data Control',
    description: 'You can delete your data and account anytime, giving you full control.',
    icon: Trash2,
  },
  {
    label: 'Dark Theme',
    description: 'Switch to dark mode anytime from account settings for a sleek experience.',
    icon: Moon,
  },
  {
    label: 'Multiple Languages',
    description: 'Use the app in different languages, easily changed from account settings.',
    icon: Languages,
  },
];
const screenshots = [
  {
    src: '/images/expense-wise/screenshots/1.png?v=1',
    alt: 'Smart expense tracking and management made easy',
  },
  {
    src: '/images/expense-wise/screenshots/2.png?v=1',
    alt: 'Stay on top of your spending in real time',
  },
  {
    src: '/images/expense-wise/screenshots/3.png?v=1',
    alt: 'Visualize where your money goes with insightful charts',
  },
  {
    src: '/images/expense-wise/screenshots/4.png?v=1',
    alt: 'Manage all your accounts in one place',
  },
  {
    src: '/images/expense-wise/screenshots/5.png?v=1',
    alt: 'Set budgets and take control of your finances',
  },
  {
    src: '/images/expense-wise/screenshots/6.png?v=1',
    alt: 'Organize expenses into custom groups',
  },
  {
    src: '/images/expense-wise/screenshots/7.png?v=1',
    alt: 'Never miss a recurring expense with automated tracking',
  },
  {
    src: '/images/expense-wise/screenshots/8.png?v=1',
    alt: 'Personalize your app to met your needs',
  },
];
const faqs = [
  {
    q: 'How do I delete all data in the app?',
    a: `All data gathered by the application are automatically deleted 
      when you uninstall the app. However, if you want to delete all data 
      without uninstalling the app, go to the account setting and click 
      on "Delete Data". But please be careful, this action is not reversible. 
      Once your data is deleted, it cannot be recovered.`,
  },
  {
    q: 'How do I delete my account?',
    a: `The app allows you to delete your account anytime you want. To delete 
      your account go to the account setting and click on "Delete Account". 
      But please be careful, this action is not reversible. Once your account is 
      deleted, all your data is deleted as well and it cannot be recovered.`,
  },
  {
    q: 'How do I change the language in the app?',
    a: `The default language of the app when you download in English, but we 
      support other languages as well. To change the app language, go to the account 
      setting and click on "Language`,
  },
  {
    q: 'Is my data automatically backed up?',
    a: `All your data is stored on your phone and is not transmitted or shared with 
      anyone else not even us. Your phone automatically backup your app data so that y
      ou can easily transfer apps from one phone to another. Aside from this backup, 
      the app does not have any other copy of your data except for what is on your phone, 
      so if you loose your phone or delete your account or delete your data it cannot 
      be restored.`,
  },
  {
    q: 'How do I create a backup?',
    a: `All your data are stored on your device and automatically backed up, so you don't 
      have to worry. However, if you uninstall the application you would loose all your data. 
      To avoid this we would add a manual backup functionality to the app in the next release.`,
  },
];
const installUrls: Record<'appStore' | 'playStore', string> = {
  appStore: 'https://apps.apple.com/us/app/expense-wise/id6456948272',
  playStore: 'https://play.google.com/store/apps/details?id=com.expensewise',
};
const data = {
  name: 'Expense-Wise',
  description: `Expense-Wise is a simple yet powerful tool designed to 
      help you take control of your personal finances. Track, manage, and 
      analyze your expenses so you can save more and spend wisely.`,
};

export const metadata: Metadata = {
  title: 'Expense-Wise | Oshomo Oforomeh',
  description:
    'Expense-Wise helps you track, manage, and analyze your expenses with curated categories, budgets, and insights.',
  openGraph: {
    title: 'Expense-Wise | Oshomo Oforomeh',
    description:
      'Track and manage your personal finances with Expense-Wise. Budgets, categories, insights, and dark mode included.',
    url: EXPENSE_WISE_URL,
    siteName: 'Oshomo Oforomeh',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expense-Wise | Oshomo Oforomeh',
    description:
      'Track and manage your personal finances with Expense-Wise. Budgets, categories, insights, and dark mode included.',
  },
  other: {
    'apple-itunes-app': 'app-id=6456948272',
  },
};

const jsonLd: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${EXPENSE_WISE_URL}#webpage`,
  url: EXPENSE_WISE_URL,
  name: 'Expense-Wise | Oshomo Oforomeh',
  description:
    'Expense-Wise helps you track, manage, and analyze your expenses with curated categories, budgets, and insights.',
  inLanguage: 'en',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${PUBLIC_URL}/#website`,
    name: 'Oshomo Oforomeh',
    url: PUBLIC_URL,
  },
  about: {
    '@type': 'SoftwareApplication',
    '@id': `${EXPENSE_WISE_URL}#app`,
    mainEntityOfPage: { '@id': `${EXPENSE_WISE_URL}#webpage` },
    name: 'Expense-Wise',
    description: data.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: ['iOS', 'Android'],
    url: EXPENSE_WISE_URL,
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
  mainEntity: {
    '@type': 'FAQPage',
    '@id': `${EXPENSE_WISE_URL}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  } as FAQPage,
};

export default function ExpenseWisePage() {
  return (
    <>
      <AppDetails
        faqs={faqs}
        url="/expense-wise"
        name={data.name}
        features={features}
        screenshots={screenshots}
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
