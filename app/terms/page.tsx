import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | Pantheon",
  description: "Terms of service for using Pantheon's portal and related services.",
}

export default function TermsPage() {
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
          Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 leading-relaxed">
              By accessing or using Pantheon&apos;s website, portal, and related services (&quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Services. We may update these Terms from time to time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2. Description of Services
            </h2>
            <p className="mt-2 leading-relaxed">
              Pantheon provides tools for professionals in life insurance, IUL, annuities, and related services, including client relationship management, meetings, courses, scripts, calendars, and communications (e.g., SMS). We reserve the right to modify, suspend, or discontinue any part of the Services with reasonable notice where practicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2A. SMS Program Terms (Pantheon CRM Portal Alerts)
            </h2>
            <p className="mt-2 leading-relaxed">
              Program name: <strong>Pantheon CRM Portal Alerts</strong>. By opting in, you agree to receive text messages
              from Pantheon CRM Portal regarding appointment reminders, account notifications, and support updates.
              Message &amp; data rates may apply. Message frequency varies. Reply <strong>STOP</strong> to opt out.
              Reply <strong>HELP</strong> for help.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              3. Account and Eligibility
            </h2>
            <p className="mt-2 leading-relaxed">
              You must be at least 18 years old and able to form a binding contract to use the Services. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and notify us promptly of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              4. Acceptable Use
            </h2>
            <p className="mt-2 leading-relaxed">
              You agree to use the Services only for lawful purposes and in accordance with these Terms. You may not: use the Services in any way that violates applicable laws or third-party rights; transmit harmful, offensive, or illegal content; attempt to gain unauthorized access to our or others&apos; systems or data; interfere with or disrupt the Services; or use the Services for spam or unsolicited communications in violation of applicable rules (e.g., TCPA). We may suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              5. Intellectual Property and License
            </h2>
            <p className="mt-2 leading-relaxed">
              Pantheon and its licensors own all rights in the Services (including software, design, and content). We grant you a limited, non-exclusive, non-transferable license to access and use the Services for your internal business use in accordance with these Terms. You retain ownership of data you submit; you grant us the rights necessary to provide, improve, and secure the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              6. Disclaimers
            </h2>
            <p className="mt-2 leading-relaxed">
              The Services are provided &quot;as is&quot; and &quot;as available.&quot; We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose. We do not guarantee that the Services will be uninterrupted, error-free, or secure. Professional advice (e.g., legal, financial, insurance) should be obtained from qualified professionals; the Services do not constitute such advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              7. Limitation of Liability
            </h2>
            <p className="mt-2 leading-relaxed">
              To the maximum extent permitted by law, Pantheon and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising out of or related to your use of the Services. Our total liability for any claims arising from or related to these Terms or the Services shall not exceed the amount you paid us in the twelve (12) months preceding the claim (or one hundred dollars if greater).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              8. Indemnification
            </h2>
            <p className="mt-2 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Pantheon and its affiliates and their respective officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the Services, your violation of these Terms, or your violation of any third-party rights or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              9. Termination
            </h2>
            <p className="mt-2 leading-relaxed">
              We may suspend or terminate your access to the Services at any time for cause (including breach of these Terms) or for convenience with reasonable notice. You may stop using the Services at any time. Upon termination, your right to use the Services ceases; provisions that by their nature should survive (e.g., disclaimers, limitation of liability, indemnification) will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              10. Governing Law and Disputes
            </h2>
            <p className="mt-2 leading-relaxed">
              These Terms are governed by the laws of the United States and the state in which Pantheon operates, without regard to conflict of laws principles. Any dispute arising from these Terms or the Services shall be resolved in the courts of that state, and you consent to personal jurisdiction there.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              11. Contact
            </h2>
            <p className="mt-2 leading-relaxed">
              For questions about these Terms of Service, please contact us through the contact information provided on our website or in your account settings.
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
            href="/privacy"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Privacy Policy
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
