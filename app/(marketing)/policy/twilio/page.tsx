import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentShell } from "@/components/legal-document-shell"
import { COMPANY_DISPLAY_NAME, SITE_ORIGIN, SUPPORT_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: `Carrier technical policy | ${COMPANY_DISPLAY_NAME}`,
  description: `How ${COMPANY_DISPLAY_NAME} uses messaging carriers (including Telnyx) for SMS and related communications.`,
  alternates: { canonical: `${SITE_ORIGIN}/policy/twilio` },
}

export default function SmsCarrierPolicyPage() {
  const last = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return (
    <LegalDocumentShell>
      <main>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          SMS &amp; carrier policy
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {COMPANY_DISPLAY_NAME} — A2P 10DLC / Telnyx-aligned disclosures
        </p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Last updated: {last}</p>

        <p className="mt-6 rounded-lg border border-zinc-200 bg-muted/40 p-4 text-sm dark:border-zinc-700">
          For customer-facing SMS disclosures (opt-in, STOP/HELP, frequency), read our{" "}
          <Link href="/sms-policy" className="font-medium text-indigo-600 underline dark:text-indigo-400">
            SMS &amp; communication policy
          </Link>
          .
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">1. Overview</h2>
            <p className="mt-2">
              {COMPANY_DISPLAY_NAME} sends and receives SMS through approved messaging carriers and CPaaS providers. We
              commonly use <strong>Telnyx</strong> and may use comparable carriers (for example Twilio) for redundancy,
              number provisioning, or regional delivery. This page describes how those providers fit into our compliance
              posture.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">2. Program use cases</h2>
            <p className="mt-2">SMS is used for service-related communications such as:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>One-time passcodes and phone verification</li>
              <li>Appointment and calendar reminders you configure</li>
              <li>Onboarding and account notifications</li>
              <li>Team invitations and operational alerts</li>
              <li>Customer support messages initiated by users</li>
            </ul>
            <p className="mt-3">
              SMS consent captured on our website and product is used for these platform communications—not for selling
              your data to unrelated marketers. See our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-indigo-600 underline underline-offset-4 dark:text-indigo-400"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">3. Data processed by carriers</h2>
            <p className="mt-2">Carriers and our messaging providers may process:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Originating and destination telephone numbers</li>
              <li>Message bodies and delivery metadata (sent, delivered, failed)</li>
              <li>Fraud-prevention and routing telemetry required by carriers</li>
            </ul>
            <p className="mt-3">
              We do not sell phone numbers or message content to third parties for their own marketing. Processors are
              bound by contract to support delivery and lawful operation only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">4. Consent, STOP, and HELP</h2>
            <p className="mt-2">
              Where applicable we obtain express consent before sending non-essential SMS, present clear disclosures at
              collection, and honor <strong>STOP</strong> and <strong>HELP</strong> keywords as described in our{" "}
              <Link href="/terms" className="font-medium text-indigo-600 underline underline-offset-4 dark:text-indigo-400">
                Terms &amp; Conditions
              </Link>
              . Transactional messages needed to secure your account may continue where permitted by law after an opt-out.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">5. Security and webhooks</h2>
            <p className="mt-2">
              Inbound carrier webhooks are authenticated and scoped to our application endpoints. We apply
              industry-standard transport security and access controls to message data at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">6. Third-party policies</h2>
            <p className="mt-2">
              Telnyx, Twilio, and mobile network operators maintain their own policies for their networks. For Telnyx
              documentation see{" "}
              <a
                href="https://telnyx.com/legal"
                className="font-medium text-indigo-600 underline underline-offset-4 dark:text-indigo-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                telnyx.com/legal
              </a>
              . For Twilio see{" "}
              <a
                href="https://www.twilio.com/legal"
                className="font-medium text-indigo-600 underline underline-offset-4 dark:text-indigo-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                twilio.com/legal
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">7. Contact</h2>
            <p className="mt-2">
              Questions about this policy:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 underline dark:text-indigo-400">
                {SUPPORT_EMAIL}
              </a>{" "}
              or{" "}
              <Link href="/contact" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                pantheonportal.com/contact
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to {COMPANY_DISPLAY_NAME}
          </Link>
        </div>
      </main>
    </LegalDocumentShell>
  )
}
