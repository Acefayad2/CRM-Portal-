import type { Metadata } from "next"
import Link from "next/link"
import { SiteLegalFooter } from "@/components/site-legal-footer"

export const metadata: Metadata = {
  title: "Twilio Use Policy | Pantheon",
  description: "How Pantheon uses Twilio for SMS and communications in compliance with applicable laws.",
}

export default function TwilioPolicyPage() {
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
          Twilio Use Policy
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-10 space-y-8 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              1. Overview
            </h2>
            <p className="mt-2 leading-relaxed">
              Pantheon uses Twilio to send and receive SMS (text messages) and related communications in connection with our services. This policy describes how we use Twilio, what data is involved, and how we comply with applicable laws and best practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2. How We Use Twilio
            </h2>
            <p className="mt-2 leading-relaxed">
              We use Twilio to:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
              <li>Send SMS notifications, verification codes, and reminders to users and clients</li>
              <li>Receive inbound SMS to our business number(s) for support and CRM workflows</li>
              <li>Track message delivery status (e.g., sent, delivered, failed) to improve reliability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              3. Data We Process Via Twilio
            </h2>
            <p className="mt-2 leading-relaxed">
              When using Twilio, we may process:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
              <li>Phone numbers (sender and recipient)</li>
              <li>Message content (body of SMS)</li>
              <li>Message identifiers and status (e.g., MessageSid, delivery status)</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              This data is used only to provide our services, support you, and improve our systems. We do not sell this information. Our use of personal data is also governed by our general Privacy Policy where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              4. Compliance and Consent
            </h2>
            <p className="mt-2 leading-relaxed">
              We are committed to complying with applicable telecommunications and privacy laws, including:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
              <li><strong>TCPA (Telephone Consumer Protection Act)</strong> — We obtain consent where required before sending marketing or automated messages and honor opt-out requests.</li>
              <li><strong>Carrier and industry guidelines</strong> — We follow Twilio’s acceptable use policies and carrier requirements.</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              If you receive a message from us and wish to opt out, reply STOP or follow the instructions in the message. We will process opt-outs promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              5. Security
            </h2>
            <p className="mt-2 leading-relaxed">
              We use Twilio’s infrastructure and APIs in a secure manner. Webhook endpoints that receive Twilio callbacks are protected and validated. Message content and phone numbers are stored and transmitted in line with our security practices and are not shared with third parties except as needed to operate the service (e.g., Twilio and our hosting provider).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              6. Twilio’s Role
            </h2>
            <p className="mt-2 leading-relaxed">
              Twilio is our communications platform provider. Twilio’s own privacy policy and terms apply to their processing of data on their systems. For more information, see{" "}
              <a
                href="https://www.twilio.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Twilio’s Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.twilio.com/legal/acceptable-use"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Acceptable Use Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              7. Changes and Contact
            </h2>
            <p className="mt-2 leading-relaxed">
              We may update this Twilio Use Policy from time to time. The “Last updated” date at the top of this page will reflect the latest version. Continued use of our services after changes constitutes acceptance of the updated policy where permitted by law.
            </p>
            <p className="mt-3 leading-relaxed">
              If you have questions about our use of Twilio or this policy, please contact us through the contact information provided on our main website or in your account settings.
            </p>
          </section>
        </div>

        <div className="mt-12 space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <SiteLegalFooter variant="legal" />
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to Pantheon Portal
          </Link>
        </div>
      </main>
    </div>
  )
}
