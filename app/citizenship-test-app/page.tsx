import React from 'react';
import { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Citizenship Test App | Oshomo Oforomeh',
  description:
    'Prepare for your citizenship test with practice questions, study guides, and progress tracking.',
  openGraph: {
    title: 'Citizenship Test App | Oshomo Oforomeh',
    description:
      'Your companion for preparing for the citizenship test. Practice, review, and succeed.',
    url: 'https://oshomo.oforomeh.com/citizenship-test-app',
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
};

export default function ExpenseWisePage() {
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
      description:
        'View your strengths, weaknesses, and improvement over time with visual insights.',
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

  return (
    <AppDetails
      url="/expense-wise"
      name="citizenship-test-app"
      features={features}
      description={`Taking the next step toward citizenship? Whether you’re preparing for the 
      German Einbürgerungstest or future tests in other countries, our app is designed to 
      help you succeed with confidence.`}
      links={{
        appStore: 'https://apps.apple.com/de/app/citizenship-test-prep/id6749445598',
        playStore: 'https://play.google.com/store/apps/details?id=com.citizenshiptestapp',
      }}
    />
  );
}
