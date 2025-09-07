import React from 'react';
import { Metadata } from 'next';
import { Wallet, PlusCircle, Layers, BarChart3, Trash2, Moon, Languages } from 'lucide-react';

import { AppDetails } from '@/components/app-details';

export const metadata: Metadata = {
  title: 'Expense-Wise | Oshomo Oforomeh',
  description:
    'Expense-Wise helps you track, manage, and analyze your expenses with curated categories, budgets, and insights.',
  openGraph: {
    title: 'Expense-Wise | Oshomo Oforomeh',
    description:
      'Track and manage your personal finances with Expense-Wise. Budgets, categories, insights, and dark mode included.',
    url: 'https://oshomo.oforomeh.com/expense-wise',
    siteName: 'Oshomo Oforomeh',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expense-Wise | Oshomo Oforomeh',
    description:
      'Track and manage your personal finances with Expense-Wise. Budgets, categories, insights, and dark mode included.',
  },
};

export default function ExpenseWisePage() {
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
      src: '/images/expense-wise/screenshots/1.png',
      alt: 'Get started with Expense-Wise',
    },
    {
      src: '/images/expense-wise/screenshots/2.png',
      alt: 'View all your expenses across curated categories',
    },
    {
      src: '/images/expense-wise/screenshots/3.png',
      alt: 'Add expenses, incomes, or transfers with just a few taps',
    },
    {
      src: '/images/expense-wise/screenshots/4.png',
      alt: 'Manage all your accounts in one place',
    },
    {
      src: '/images/expense-wise/screenshots/5.png',
      alt: 'See all transaction in a category',
    },
    {
      src: '/images/expense-wise/screenshots/6.png',
      alt: 'Update your account settings and preferences',
    },
    {
      src: '/images/expense-wise/screenshots/7.png',
      alt: 'Change to dark mode from account settings',
    },
    {
      src: '/images/expense-wise/screenshots/8.png',
      alt: 'Change the app language from account settings',
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

  return (
    <AppDetails
      faqs={faqs}
      url="/expense-wise"
      name="expense-wise"
      features={features}
      screenshots={screenshots}
      description={`Expense-Wise is a simple yet powerful tool designed to 
      help you take control of your personal finances. Track, manage, and 
      analyze your expenses so you can save more and spend wisely.`}
      links={{
        appStore: 'https://apps.apple.com/us/app/expense-wise/id6456948272',
        playStore: 'https://play.google.com/store/apps/details?id=com.expensewise',
      }}
    />
  );
}
