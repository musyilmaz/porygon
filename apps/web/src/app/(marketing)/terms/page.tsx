import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Porygon — the interactive demo platform. Read our terms covering account usage, intellectual property, and more.",
  openGraph: {
    title: "Terms of Service — Porygon",
    description:
      "Terms of Service for Porygon — the interactive demo platform.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p className="lead">
          Last updated: March 19, 2026
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Porygon (&quot;the Service&quot;), you agree to
          be bound by these Terms of Service. If you do not agree to these
          terms, do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Porygon is a cloud-based platform that enables users to create, edit,
          and share interactive product demos. The Service includes a web
          application, browser extension, and embeddable demo player.
        </p>

        <h2>3. Account Registration</h2>
        <p>
          To use certain features of the Service, you must create an account.
          You agree to provide accurate, current, and complete information
          during registration and to keep your account information up to date.
          You are responsible for safeguarding your password and for all
          activities that occur under your account.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
          <li>Upload or transmit viruses, malware, or other malicious code</li>
          <li>Attempt to gain unauthorized access to the Service or its related systems</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>Use the Service to infringe on the intellectual property rights of others</li>
          <li>Resell or redistribute the Service without prior written consent</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are
          owned by Porygon and are protected by international copyright,
          trademark, and other intellectual property laws. You retain ownership
          of any content you create using the Service.
        </p>

        <h2>6. User Content</h2>
        <p>
          You are solely responsible for the content you create, upload, or
          share through the Service. By using the Service, you grant Porygon a
          limited license to host, store, and display your content solely for
          the purpose of providing the Service to you.
        </p>

        <h2>7. Subscription and Billing</h2>
        <p>
          Certain features of the Service require a paid subscription. Pricing,
          billing cycles, and plan details are described on our pricing page.
          Porygon reserves the right to modify pricing with reasonable notice.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may terminate or suspend your account at any time, without prior
          notice or liability, for any reason, including if you breach these
          Terms. Upon termination, your right to use the Service will
          immediately cease.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Porygon shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, or any loss of profits or revenues, whether incurred directly
          or indirectly, or any loss of data, use, goodwill, or other
          intangible losses resulting from your use of the Service.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, whether express
          or implied, including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the jurisdiction in which Porygon operates, without regard to
          its conflict of law provisions.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will
          notify users of any material changes by posting the updated Terms on
          this page with a revised &quot;Last updated&quot; date. Your continued
          use of the Service after changes constitutes acceptance of the
          modified Terms.
        </p>

        <h2>13. Contact</h2>
        <p>
          If you have questions about these Terms of Service, please contact us
          at{" "}
          <a href="mailto:legal@porygon.io">legal@porygon.io</a>.
        </p>
      </div>
    </div>
  );
}
