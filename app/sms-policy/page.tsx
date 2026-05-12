import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentShell } from "@/components/legal-document-shell"
import {
  COMPANY_DISPLAY_NAME,
  SITE_ORIGIN,
  SUPPORT_EMAIL,
  smsProgram,
} from "@/lib/site"

const canonical = `${SITE_ORIGIN}/sms-policy`

export const metadata: Metadata = {
  title: "SMS & communication policy",
  description: `How ${COMPANY_DISPLAY_NAME} uses SMS, opt-in, STOP/HELP, and message frequency for financial professionals and agencies.`,
  alternates: { canonical },
  openGraph: {
    title: `SMS & communication policy | ${COMPANY_DISPLAY_NAME}`,
    description: `TCPA-friendly SMS disclosures and program description for ${COMPANY_DISPLAY_NAME}.`,
    url: canonical,
    siteName: COMPANY_DISPLAY_NAME,
    type: "article",
  },
}

export default function SmsPolicyPage() {
  const last = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return (
    <LegalDocumentShell>
      <main>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          SMS &amp; communication policy
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_DISPLAY_NAME}</p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Last updated: {last}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">1. What this policy covers</h2>
            <p className="mt-2">
              This document describes how <strong>{COMPANY_DISPLAY_NAME}</strong> uses SMS and related communications
              in connection with our CRM and client communication platform for <strong>financial professionals and
              agencies</strong>. It supplements our{" "}
              <Link href="/privacy-policy" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </section>

          <section className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-5 dark:border-indigo-500/30 dark:bg-indigo-950/40">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">2. Program description &amp; opt-in</h2>
            <p className="mt-2">
              When you provide your mobile number and opt in (including by checking the SMS consent box on our forms),
              you agree to receive SMS from {COMPANY_DISPLAY_NAME} for operational and service-related purposes,
              including:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 pl-1">
              <li>Appointment reminders</li>
              <li>Onboarding updates</li>
              <li>Account notifications</li>
              <li>Follow-ups related to your use of the platform and your configured workflows</li>
            </ul>
            <p className="mt-4 font-medium text-zinc-900 dark:text-white">
              {smsProgram.frequencyDisclosure} {smsProgram.shortCarrierLine}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">3. Message frequency and rates</h2>
            <p className="mt-2">
              <strong>Message frequency may vary</strong> based on your account activity, reminders, and system events.
              <strong> Message and data rates may apply</strong> — check with your wireless carrier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">4. Opt out and help</h2>
            <p className="mt-2">
              <strong>Reply STOP</strong> to opt out of optional program SMS where supported. <strong>Reply HELP</strong>{" "}
              for help. You may also contact{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 underline dark:text-indigo-400">
                {SUPPORT_EMAIL}
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                Contact
              </Link>{" "}
              page. Some transactional or security messages may be sent where permitted by law after an opt-out.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">5. Carriers and delivery</h2>
            <p className="mt-2">
              Mobile carriers are <strong>not liable</strong> for delayed or undelivered messages. {COMPANY_DISPLAY_NAME}{" "}
              may use approved messaging providers (including Telnyx) to deliver SMS. See also our{" "}
              <Link href="/policy/twilio" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                carrier &amp; technical policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">6. Business contact</h2>
            <p className="mt-2">
              Public website:{" "}
              <a href={SITE_ORIGIN} className="font-medium text-indigo-600 underline dark:text-indigo-400">
                {SITE_ORIGIN.replace(/^https:\/\//, "")}
              </a>
              <br />
              Support:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 underline dark:text-indigo-400">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
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
