import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Pantheon",
  description: "How Pantheon collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
          >
            Pantheon
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              1. Overview
            </h2>
            <p className="mt-2 leading-relaxed">
              Pantheon (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy describes how we collect, use, store, and share information when you use our services, including our website, portal, and related tools for life insurance, IUL, annuities, and client relationship management.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2. Information We Collect
            </h2>
            <p className="mt-2 leading-relaxed">
              We may collect:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
              <li>
                <strong>Account and profile data</strong> — name, email, phone number, and profile preferences
              </li>
              <li>
                <strong>Client and business data</strong> — information you enter about clients, meetings, courses, and scripts
              </li>
              <li>
                <strong>Usage data</strong> — how you use the portal (e.g., pages visited, features used) to improve our services
              </li>
              <li>
                <strong>Communications</strong> — messages sent or received via our systems (e.g., SMS via Twilio). See our{" "}
                <Link href="/policy/twilio" className="text-primary underline hover:no-underline">
                  Twilio Use Policy
                </Link>{" "}
                for details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2A. SMS Program Data and Consent
            </h2>
            <p className="mt-2 leading-relaxed">
              Pantheon CRM Portal collects your name, phone number, and (optionally) email when you sign up for
              our SMS program. We send appointment reminders, account notifications, and support updates. SMS consent
              is collected using an unchecked checkbox that requires your express written consent before submission.
              Message &amp; data rates may apply and message frequency varies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <p className="mt-2 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services; to authenticate you and manage your account; to send notifications and support communications; to comply with legal obligations; and to protect the security and integrity of our systems. We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              4. Sharing and Disclosure
            </h2>
            <p className="mt-2 leading-relaxed">
              We may share information with service providers who assist us (e.g., hosting, analytics, communications). We require them to use the data only for the purposes we specify and in line with this policy. We may also disclose information when required by law or to protect our rights, safety, or property.
            </p>
            <p className="mt-3 leading-relaxed">
              Mobile information will not be shared with third parties/affiliates for marketing or promotional purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              5. Security
            </h2>
            <p className="mt-2 leading-relaxed">
              We use industry-standard measures to protect your data, including encryption in transit and at rest where applicable, access controls, and secure development practices. No method of transmission or storage is 100% secure; we encourage you to use strong passwords and keep your account details confidential.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              6. Your Rights and Choices
            </h2>
            <p className="mt-2 leading-relaxed">
              Depending on where you live, you may have the right to access, correct, delete, or port your personal data, or to object to or restrict certain processing. You can update much of your profile and privacy settings in the portal. To exercise other rights or ask questions, contact us using the details provided below.
            </p>
            <p className="mt-3 leading-relaxed">
              To opt out of SMS messages, reply <strong>STOP</strong> at any time. For help, reply <strong>HELP</strong> or contact us using the support details provided on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              7. Changes and Contact
            </h2>
            <p className="mt-2 leading-relaxed">
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top reflects the latest version. Continued use of our services after changes constitutes acceptance where permitted by law.
            </p>
            <p className="mt-3 leading-relaxed">
              For questions about this Privacy Policy or our practices, please contact us through the contact information on our website or in your account settings.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to Pantheon
          </Link>
          <Link
            href="/policy/twilio"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Twilio Use Policy
          </Link>
        </div>
      </main>
    </div>
  )
}
