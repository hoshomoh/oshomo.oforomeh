import React from "react";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Oshomo Oforomeh",
  description:
    "Privacy Policy for all apps by Oshomo Oforomeh, including Expense-Wise and Citizenship Test App. Learn how your data is collected, used, and protected.",
  openGraph: {
    title: "Privacy Policy | Oshomo Oforomeh",
    description:
      "Covers data usage, collection, and security for Expense-Wise, Citizenship Test App, and other apps.",
    url: "https://oshomo.oforomeh.com/privacy",
    siteName: "Oshomo Oforomeh",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Oshomo Oforomeh",
    description:
      "Covers data usage, collection, and security for Expense-Wise, Citizenship Test App, and other apps.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full flex-1 font-mono flex p-8">
        <div className="flex flex-col gap-12 w-[36rem] text-left">
          {/* Top links */}
          <div className="flex items-center gap-2 font-medium">
            <a className="flex items-center gap-2" href="/">oshomo</a> /{/* */}
            <a href="/privacy-policy">privacy policy</a>
          </div>

          {/* Page Title */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">privacy-policy</h2>
            <p className="text-sm">Last updated: September 5, 2025</p>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 text-sm leading-6">
            <p>
              This Privacy Policy describes how Oshomo Oforomeh (“we”, “our”, or “us”) collects, uses, and protects your information when you use any of our applications, including <strong>Expense-Wise</strong>, <strong>Citizenship Test App</strong>, and any other apps we may publish (collectively, the “Apps”).
            </p>
            <p>
              By downloading, installing, or using our Apps, you agree to this Privacy Policy. If you do not agree, please do not use the Apps.
            </p>

            <div>
              <h2 className="font-semibold mb-2">1. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Information You Provide:</strong> Account info, transactions, and support requests.</li>
                <li><strong>Automatically Collected Info:</strong> Device data, usage analytics, and crash logs.</li>
                <li><strong>Optional Permissions:</strong> Storage, notifications, and internet access to enable features.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-2">2. How We Use Your Information</h2>
              <p>We use your information to provide, improve, and secure our apps, personalize your experience, respond to support, and send updates (if opted in). We do not sell your data.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">3. Data Storage & Security</h2>
              <p>Your data may be stored locally or securely in the cloud. We apply reasonable measures to protect it, but you are responsible for securing your credentials.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">4. Data Deletion</h2>
              <p>You can delete your data and account anytime via in-app settings or by emailing <a href="mailto:hello@oshomo.oforomeh.com" className="underline">hello@oshomo.oforomeh.com</a>.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">5. Children’s Privacy</h2>
              <p>Our Apps are not directed to children under 13. We do not knowingly collect data from children. If a child has provided information, contact us for deletion.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">6. Third-Party Services</h2>
              <p>Some apps may use third-party services (Google Play Services, Apple App Store Services, Firebase) which collect data per their own policies.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">7. International Users</h2>
              <p>Your data may be transferred to and processed in countries outside your own. Protections may differ depending on jurisdiction.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">8. Your Rights</h2>
              <p>You may have rights under GDPR or other laws (access, correction, deletion, withdrawal of consent). Contact us to exercise your rights.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you by updating the “Last Updated” date or via in-app notice.</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">10. Contact Us</h2>
              <p>
                Oshomo Oforomeh <br />
                Email: <a href="mailto:hello@oshomo.oforomeh.com" className="underline">hello@oshomo.oforomeh.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
