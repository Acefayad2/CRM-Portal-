import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentShell } from "@/components/legal-document-shell"

const canonical = "https://pantheonportal.com/privacy-policy"

export const metadata: Metadata = {
  title: "Privacy Policy | Pantheon Portal",
  description:
    "Privacy Policy for Pantheon Portal, including SMS and A2P 10DLC practices for financial services professionals.",
  alternates: { canonical },
  openGraph: {
    title: "Privacy Policy | Pantheon Portal",
    description:
      "How Pantheon collects, uses, and protects information when you use Pantheon Portal, including SMS communications.",
    url: canonical,
    siteName: "Pantheon Portal",
    type: "website",
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <LegalDocumentShell>
      <main>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pantheon Portal — Financial services CRM and client communications
        </p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              1. Who we are
            </h2>
            <p className="mt-2">
              This Privacy Policy describes how{" "}
              <strong>Pantheon</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) handles information when you use{" "}
              <strong>Pantheon Portal</strong> and related services (the &quot;Services&quot;). Pantheon Portal is a CRM and
              client communication platform designed for agents and financial professionals to manage relationships,
              appointments, and compliant outreach.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              2. SMS messages and your consent
            </h2>
            <p className="mt-2">
              <strong>Pantheon may send SMS messages to users who affirmatively opt in</strong> to receive text
              messages from Pantheon. SMS messages may include: <strong>appointment reminders</strong>,{" "}
              <strong>onboarding updates</strong>, <strong>account notifications</strong>, <strong>customer support</strong>{" "}
              communications, and <strong>service follow-ups</strong>, consistent with the consent you provided.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1">
              <li>
                <strong>Message frequency may vary</strong> based on your activity, reminders you configure, and
                account events.
              </li>
              <li>
                <strong>Message and data rates may apply</strong> according to your mobile carrier plan.
              </li>
              <li>
                You may opt out of marketing or non-essential SMS where applicable by following the instructions we
                provide; <strong>you can reply STOP to opt out</strong> of program messages as described in those
                messages or our SMS terms.
              </li>
              <li>
                <strong>Reply HELP for help</strong> or contact us through the information provided on{" "}
                <a
                  href="https://pantheonportal.com/"
                  className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
                >
                  pantheonportal.com
                </a>{" "}
                or in your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              3. Mobile numbers and SMS consent — no sale for marketing
            </h2>
            <p className="mt-2 font-medium text-zinc-900 dark:text-white">
              Mobile numbers and SMS consent information collected in connection with Pantheon&apos;s SMS program will not
              be sold, rented, or shared with third parties for their own marketing or promotional purposes.
            </p>
            <p className="mt-3">
              We may share information with service providers (such as our SMS carrier partner, e.g. Twilio) strictly as
              needed to deliver messages you have opted into, to operate the Services, and as required by law. For more
              detail, see our{" "}
              <Link
                href="/policy/twilio"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
              >
                Twilio / SMS use policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              4. Information we collect
            </h2>
            <p className="mt-2">
              We may collect account and contact data (such as name, email, and phone number), information you enter
              about clients and workflows, usage and device information, and communications sent or received through the
              Services. In regulated industries, we design our practices to support your compliance obligations;
              you remain responsible for your use of the Services in line with applicable laws and firm policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              5. How we use information
            </h2>
            <p className="mt-2">
              We use information to provide, secure, and improve Pantheon Portal; to authenticate users; to send
              operational and opted-in SMS and email notifications; to provide support; and to comply with law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              6. Security and retention
            </h2>
            <p className="mt-2">
              We use administrative, technical, and organizational measures appropriate to the nature of the Services.
              Retention periods depend on the type of data and our legal, security, and operational needs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              7. Your choices and rights
            </h2>
            <p className="mt-2">
              You may access and update certain information in your account. Depending on your location, you may have
              additional privacy rights under applicable law. To exercise rights or ask questions, contact us using the
              channels provided on our website or in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              8. Updates to this policy
            </h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date reflects the latest
              version. Where changes are material, we will provide notice as appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              9. Related documents
            </h2>
            <p className="mt-2">
              Please also read our{" "}
              <Link
                href="/terms"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
              >
                Terms & Conditions
              </Link>{" "}
              for SMS program terms and our{" "}
              <Link
                href="/policy/twilio"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
              >
                SMS & Twilio policy
              </Link>
              .
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
