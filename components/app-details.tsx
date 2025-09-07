import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import playStoreIcon from '../public/googleplay.svg';
import appStoreIcon from '../public/appstore.svg';

type Props = {
  url: string;
  name: string;
  description: string;
  features: Array<{
    label: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
  faqs?: Array<{
    q: string;
    a: string;
  }>;
  screenshots?: Array<{
    src: string;
    alt: string;
  }>;
  links: {
    appStore: string;
    playStore: string;
  };
};
export function AppDetails({ url, faqs, name, links, description, features, screenshots }: Props) {
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
            <Link href={url}>{name}</Link>
          </div>

          {/* App Name */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">{name}</h2>
            <div className="text-sm font-medium text-balance space-y-4">
              <p>{description}</p>
            </div>

            {/* Download Buttons (side by side) */}
            <div className="mt-4 flex items-center gap-4">
              <Link href={links.appStore} target="_blank">
                <Image
                  priority
                  src={appStoreIcon}
                  alt="Download on the App Store"
                  className="w-36"
                />
              </Link>
              <Link href={links.playStore} target="_blank">
                <Image priority src={playStoreIcon} alt="Get It on Google Play" className="w-36" />
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">features</h2>
            <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
              {features.map(({ label, description, icon: Icon }) => (
                <div key={label} className="flex flex-col items-start gap-2 border rounded-lg p-3">
                  <Icon className="h-6 w-6 text-green-600" />
                  <span className="font-semibold">{label}</span>
                  <p className="text-[0.85rem] text-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Screens Carousel */}
          {Boolean(screenshots?.length) && (
            <div className="flex flex-col gap-2" id="screenshots">
              <h2 className="text-lg font-medium">screenshots</h2>
              <Carousel className="w-full max-w-[320px]">
                <CarouselContent>
                  {screenshots?.map(({ src, alt }) => (
                    <CarouselItem key={src}>
                      <Image
                        src={src}
                        alt={alt}
                        width={320}
                        height={640}
                        className="rounded-2xl border h-auto w-auto max-w-full"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 z-10" />
                <CarouselNext className="right-2 z-10" />
              </Carousel>
            </div>
          )}

          {/* FAQ Section */}
          {Boolean(faqs?.length) && (
            <div className="flex flex-col gap-4" id="faqs">
              <h2 className="text-lg font-medium">faqs</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs?.map(({ q, a }, idx) => (
                  <AccordionItem key={q} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger>
                    <AccordionContent className="text-sm leading-6">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
