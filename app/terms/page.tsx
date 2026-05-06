import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentShell } from "@/components/legal-document-shell"

const canonical = "https://pantheonportal.com/terms"

export const metadata: Metadata = {
  title: "Terms and Conditions | Pantheon Portal",
  description:
    "Terms and conditions for Pantheon Portal, including SMS consent and A2P 10DLC-related terms for financial services professionals.",
  alternates: { canonical },
  openGraph: {
    title: "Terms and Conditions | Pantheon Portal",
    description:
      "Terms governing use of Pantheon Portal, including SMS messaging and opt-in consent.",
    url: canonical,
    siteName: "Pantheon Portal",
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
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pantheon Portal — Financial services CRM and client communications
        </p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              1. Agreement to these terms
            </h2>
            <p className="mt-2">
              By accessing or using Pantheon Portal and related services (the &quot;Services&quot;), you agree to these Terms
              and Conditions (&quot;Terms&quot;). If you do not agree, do not use the Services. We may update these Terms;
              continued use after the effective date of changes constitutes acceptance where permitted by law.
            </p>
          </section>

          <section className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-5 dark:border-indigo-500/30 dark:bg-indigo-950/40">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2. SMS text messages — consent and program terms
            </h2>
            <p className="mt-2 font-medium text-zinc-900 dark:text-white">
              By submitting a form, registering for an account, scheduling through the Services, checking an opt-in box,
              or otherwise providing prior express consent as presented, you consent to receive SMS text messages from{" "}
              <strong>Pantheon</strong> regarding Pantheon Portal and related services.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1">
              <li>
                <strong>Message frequency may vary</strong> based on reminders, onboarding steps, support, account
                activity, and your settings.
              </li>
              <li>
                <strong>Message and data rates may apply</strong> — check with your wireless carrier.
              </li>
              <li>
                <strong>Reply STOP to opt out</strong> of non-transactional or program SMS where STOP is offered in
                the message flow, or follow other instructions we provide for preferences.
              </li>
              <li>
                <strong>Reply HELP</strong> for help or contact us via the information on{" "}
                <a
                  href="https://pantheonportal.com/"
                  className="font-medium text-indigo-700 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-600 dark:text-indigo-300"
                >
                  pantheonportal.com
                </a>
                .
              </li>
              <li>
                <strong>Consent to receive SMS is not a condition of purchase</strong> of any good or service, except
                where you voluntarily opt in to receive messages as described at the point of collection.
              </li>
            </ul>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Program use cases may include appointment reminders, onboarding updates, account notifications, customer
              support, and service follow-ups, consistent with your consent and applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              3. Description of services
            </h2>
            <p className="mt-2">
              Pantheon provides a CRM and communication platform for agents and financial professionals, including
              tools for client relationships, meetings, scripts, calendars, courses, and communications (including SMS).
              We may modify or discontinue features with reasonable notice where practicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              4. Accounts and eligibility
            </h2>
            <p className="mt-2">
              You must be able to form a binding contract and meet any eligibility requirements we communicate. You are
              responsible for your account credentials and activity. Provide accurate information and notify us of
              unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              5. Acceptable use
            </h2>
            <p className="mt-2">
              Use the Services lawfully and only as permitted by these Terms and applicable regulations governing your
              industry (including TCPA, CAN-SPAM, and financial communication rules where they apply). Do not misuse
              messaging features, send unlawful content, or attempt to bypass security. We may suspend or terminate
              access for violations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              6. Intellectual property
            </h2>
            <p className="mt-2">
              Pantheon and its licensors own the Services. We grant you a limited, non-exclusive license to use the
              Services for your internal business purposes. You retain rights in your data; you grant us rights necessary
              to operate and improve the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              7. Disclaimers
            </h2>
            <p className="mt-2">
              The Services are provided &quot;as is&quot; and &quot;as available.&quot; We disclaim warranties to the fullest extent
              permitted by law. The Services do not constitute financial, legal, or insurance advice — obtain advice
              from qualified professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              8. Limitation of liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, Pantheon and its affiliates will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or for lost profits or data. Our aggregate
              liability arising out of these Terms or the Services is limited to the amount you paid us in the twelve
              (12) months before the claim (or one hundred U.S. dollars if greater), except where limitations are
              prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              9. Indemnification
            </h2>
            <p className="mt-2">
              You agree to indemnify and hold harmless Pantheon and its affiliates from claims arising out of your use of
              the Services, your content, or your violation of these Terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              10. Termination
            </h2>
            <p className="mt-2">
              Either party may stop using the Services. We may suspend or terminate access for cause or as described in
              these Terms. Provisions that should survive termination (including disclaimers, limitations, and
              indemnities) will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              11. Governing law
            </h2>
            <p className="mt-2">
              These Terms are governed by the laws of the United States and the state in which Pantheon operates,
              excluding conflict-of-law rules. Courts in that state have exclusive jurisdiction, unless otherwise required
              by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              12. Contact and related policies
            </h2>
            <p className="mt-2">
              For questions about these Terms, contact us through the information provided at{" "}
              <a
                href="https://pantheonportal.com/"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
              >
                pantheonportal.com
              </a>{" "}
              or in your account. Our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
              >
                Privacy Policy
              </Link>{" "}
              describes how we handle personal information, including SMS-related practices.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to Pantheon Portal
          </Link>
        </div>
      </main>
    </LegalDocumentShell>
  )
}
