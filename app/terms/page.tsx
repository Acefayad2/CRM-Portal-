import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentShell } from "@/components/legal-document-shell"
import { COMPANY_DISPLAY_NAME, SITE_ORIGIN, SUPPORT_EMAIL, smsProgram } from "@/lib/site"

const canonical = `${SITE_ORIGIN}/terms`

export const metadata: Metadata = {
  title: `Terms and Conditions | ${COMPANY_DISPLAY_NAME}`,
  description: `Terms for ${COMPANY_DISPLAY_NAME}, including SMS consent, STOP/HELP, and carrier-related disclosures.`,
  alternates: { canonical },
  openGraph: {
    title: `Terms and Conditions | ${COMPANY_DISPLAY_NAME}`,
    description: `Terms governing use of ${COMPANY_DISPLAY_NAME}, including SMS messaging and opt-in consent.`,
    url: canonical,
    siteName: COMPANY_DISPLAY_NAME,
    type: "website",
  },
}

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <LegalDocumentShell>
      <main>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_DISPLAY_NAME}</p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">1. Agreement to these terms</h2>
            <p className="mt-2">
              By accessing or using {COMPANY_DISPLAY_NAME} and related services (the &quot;Services&quot;), you agree to
              these Terms and Conditions (&quot;Terms&quot;). If you do not agree, do not use the Services. We may
              update these Terms; continued use after the effective date of changes constitutes acceptance where
              permitted by law.
            </p>
          </section>

          <section className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-5 dark:border-indigo-500/30 dark:bg-indigo-950/40">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">2. SMS text messages — disclosure</h2>
            <p className="mt-2 font-medium text-zinc-900 dark:text-white">
              By providing your mobile number, checking our SMS consent box where presented, and submitting a form or
              account request, you agree to receive SMS messages from {COMPANY_DISPLAY_NAME} regarding appointments,
              account notifications, onboarding, and platform updates consistent with your consent.
            </p>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">{smsProgram.frequencyDisclosure}</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1">
              <li>
                <strong>Message and data rates may apply</strong> — contact your carrier with questions about your plan.
              </li>
              <li>
                <strong>Reply STOP</strong> to unsubscribe from optional program SMS where STOP is supported for that
                message program.
              </li>
              <li>
                <strong>Reply HELP</strong> for help or email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-indigo-800 underline dark:text-indigo-300"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </li>
              <li>
                <strong>Consent is not a condition of purchase</strong> of unrelated goods or services, except that
                certain security or transactional messages may be necessary to operate your account as permitted by law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">3. User consent requirements</h2>
            <p className="mt-2">
              You represent that you are the subscriber of the mobile number you provide or that you have authority to
              consent on behalf of the subscriber. You agree not to opt in third parties without proper authorization.
              For SMS you initiate to your own clients or contacts, you are responsible for obtaining legally sufficient
              consent and honoring opt-outs under applicable law (including TCPA and industry rules).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">4. Carrier disclaimer</h2>
            <p className="mt-2">
              <strong>
                Mobile carriers and messaging providers are not liable for delayed or undelivered messages
              </strong>
              . Service may not be available in all areas or on all devices. Delivery depends on network conditions,
              device compatibility, and factors outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">5. Description of services</h2>
            <p className="mt-2">
              {COMPANY_DISPLAY_NAME} provides CRM, scheduling, collaboration, training, and communications tools,
              including optional SMS through approved carriers (such as Telnyx). We may modify or discontinue features
              with reasonable notice where practicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">6. Accounts and eligibility</h2>
            <p className="mt-2">
              You must be able to form a binding contract and meet eligibility requirements we communicate. You are
              responsible for credentials and all activity under your account. Notify us promptly of unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">7. Acceptable use</h2>
            <p className="mt-2">
              Use the Services lawfully and only as permitted by these Terms and regulations applicable to you (including
              TCPA, CAN-SPAM, and financial or professional communication rules where relevant). Do not misuse messaging,
              spoof sender identities, or attempt to bypass security. We may suspend or terminate access for violations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">8. Intellectual property</h2>
            <p className="mt-2">
              {COMPANY_DISPLAY_NAME} and its licensors own the Services. We grant you a limited, non-exclusive license to
              use the Services for your internal business purposes. You retain rights in your data; you grant us rights
              reasonably necessary to operate and improve the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">9. Disclaimers</h2>
            <p className="mt-2">
              The Services are provided &quot;as is&quot; and &quot;as available.&quot; We disclaim warranties to the
              fullest extent permitted by law. The Services do not constitute professional advice—consult qualified
              advisors as needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">10. Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, {COMPANY_DISPLAY_NAME} and its affiliates will not be liable for
              indirect, incidental, special, consequential, or punitive damages, or for lost profits or data. Our
              aggregate liability arising out of these Terms or the Services is limited to the amount you paid us in
              the twelve (12) months before the claim (or one hundred U.S. dollars if greater), except where
              limitations are prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">11. Indemnification</h2>
            <p className="mt-2">
              You agree to indemnify and hold harmless {COMPANY_DISPLAY_NAME} and its affiliates from claims arising out
              of your use of the Services, your content, or your violation of these Terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">12. Termination</h2>
            <p className="mt-2">
              Either party may stop using the Services. We may suspend or terminate access for cause or as described in
              these Terms. Provisions that should survive termination will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">13. Governing law</h2>
            <p className="mt-2">
              These Terms are governed by the laws of the United States and the state in which we operate, excluding
              conflict-of-law rules. Courts in that state have exclusive jurisdiction unless otherwise required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">14. Contact and related policies</h2>
            <p className="mt-2">
              Questions:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or{" "}
              <a
                href={`${SITE_ORIGIN}/contact`}
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                {SITE_ORIGIN.replace(/^https:\/\//, "")}/contact
              </a>
              . Our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/policy/twilio"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                SMS &amp; carrier policy
              </Link>{" "}
              provide additional detail.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
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
