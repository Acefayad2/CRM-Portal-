import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentShell } from "@/components/legal-document-shell"
import { COMPANY_DISPLAY_NAME, SITE_ORIGIN, SUPPORT_EMAIL, smsProgram } from "@/lib/site"

const canonical = `${SITE_ORIGIN}/privacy-policy`

export const metadata: Metadata = {
  title: `Privacy Policy | ${COMPANY_DISPLAY_NAME}`,
  description: `Privacy Policy for ${COMPANY_DISPLAY_NAME}, including SMS, phone numbers, and A2P 10DLC-related practices.`,
  alternates: { canonical },
  openGraph: {
    title: `Privacy Policy | ${COMPANY_DISPLAY_NAME}`,
    description: `How ${COMPANY_DISPLAY_NAME} collects, uses, and protects information, including SMS communications.`,
    url: canonical,
    siteName: COMPANY_DISPLAY_NAME,
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_DISPLAY_NAME}</p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">1. Who we are</h2>
            <p className="mt-2">
              This Privacy Policy explains how <strong>{COMPANY_DISPLAY_NAME}</strong> (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) collects, uses, and shares information when you use our websites, applications, and
              related services (the &quot;Services&quot;). Our Services include CRM workflows, calendars, meetings, and
              messaging features that may involve <strong>SMS text messages</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">2. Phone numbers and related data</h2>
            <p className="mt-2">
              <strong>We collect user phone numbers and related account data</strong> when you register, verify your
              identity, update your profile, or otherwise provide a mobile number. We also process telephone numbers you
              upload about your clients or contacts strictly to provide the Services you configure (for example reminders
              or team invitations).
            </p>
            <p className="mt-3">
              Phone numbers may be stored with your account record and used to send SMS through our messaging
              infrastructure (including carriers such as <strong>Telnyx</strong> or comparable providers). Processing is
              described further in our{" "}
              <Link
                href="/policy/twilio"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 hover:text-indigo-500 dark:text-indigo-400"
              >
                SMS &amp; carrier policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">3. SMS consent and platform communications</h2>
            <p className="mt-2">
              When you opt in to SMS (for example by checking our SMS consent box and submitting a form),{" "}
              <strong>that consent is used to send SMS related to our platform and your account</strong>—such as
              verification codes, appointment and calendar reminders you enable, onboarding and account notifications,
              and operational updates about the Services.
            </p>
            <p className="mt-3">{smsProgram.frequencyDisclosure}</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1">
              <li>
                <strong>Message and data rates may apply</strong> according to your wireless plan.
              </li>
              <li>
                <strong>Reply STOP</strong> to cancel optional program SMS where supported.
              </li>
              <li>
                <strong>Reply HELP</strong> for assistance or contact{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              4. No sale of data for third-party marketing without consent
            </h2>
            <p className="mt-2">
              <strong>
                We do not sell your phone number or personal information, and we do not share it with unrelated third
                parties for their own marketing, without your consent
              </strong>{" "}
              (except as permitted by law or as described for processors who help us run the Services).
            </p>
            <p className="mt-3">
              We may share limited information with service providers—such as hosting, analytics, authentication, and SMS
              carriers—under contracts that restrict their use to providing services to us. We may also disclose
              information if required by law or to protect rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">5. Other information we collect</h2>
            <p className="mt-2">
              Depending on how you use the Services, we may collect identifiers (name, email), professional information,
              content you upload (including client records you choose to store), usage and device data, and communications
              you send through the platform. In regulated industries, you remain responsible for your compliance with
              applicable laws and firm policies when using the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">6. How we use information</h2>
            <p className="mt-2">
              We use information to operate, secure, and improve the Services; authenticate users; deliver SMS and email
              you have opted into; provide support; bill and administer accounts; and comply with law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">7. Security and retention</h2>
            <p className="mt-2">
              We implement administrative, technical, and organizational safeguards appropriate to the Services.
              Retention depends on the type of record, your settings, and legal or security needs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">8. Your choices and rights</h2>
            <p className="mt-2">
              You may access or update certain information in your account. Depending on your location, you may have
              additional privacy rights under applicable law. To exercise rights or ask questions, contact us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or visit{" "}
              <Link
                href="/contact"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                {SITE_ORIGIN.replace(/^https:\/\//, "")}/contact
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">9. Updates</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date reflects the latest
              version. Material changes will be posted here and, where appropriate, notified through the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">10. Related documents</h2>
            <p className="mt-2">
              Please also read our{" "}
              <Link
                href="/terms"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/sms-policy"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                SMS &amp; communication policy
              </Link>
              , and{" "}
              <Link
                href="/policy/twilio"
                className="font-medium text-indigo-600 underline decoration-indigo-600/30 underline-offset-4 dark:text-indigo-400"
              >
                carrier technical policy
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
            ← Back to {COMPANY_DISPLAY_NAME}
          </Link>
        </div>
      </main>
    </LegalDocumentShell>
  )
}
