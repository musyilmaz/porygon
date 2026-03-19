import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Porygon — learn how we collect, use, and protect your data on our interactive demo platform.",
  openGraph: {
    title: "Privacy Policy — Porygon",
    description:
      "Privacy Policy for Porygon — learn how we collect, use, and protect your data.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="lead">
          Last updated: March 19, 2026
        </p>

        <h2>1. Information We Collect</h2>
        <h3>Information you provide</h3>
        <ul>
          <li>Account information (name, email address, password)</li>
          <li>Demo content you create, upload, or share through the Service</li>
          <li>Communications you send to us (support requests, feedback)</li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>Usage data (pages visited, features used, actions taken)</li>
          <li>Device information (browser type, operating system, screen resolution)</li>
          <li>Log data (IP address, access times, referring URLs)</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service</li>
          <li>Create and manage your account</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
        </ul>

        <h2>3. Cookies and Tracking</h2>
        <p>
          We use essential cookies to maintain your session and preferences.
          We may also use analytics cookies to understand how users interact
          with the Service. You can control cookie settings through your
          browser preferences.
        </p>

        <h2>4. Data Sharing and Third Parties</h2>
        <p>
          We do not sell your personal information. We may share your
          information with third parties only in the following circumstances:
        </p>
        <ul>
          <li>With service providers who assist in operating the Service (hosting, analytics, email delivery)</li>
          <li>To comply with legal obligations or respond to lawful requests</li>
          <li>To protect the rights, property, or safety of Porygon, our users, or the public</li>
          <li>In connection with a merger, acquisition, or sale of assets (with notice)</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized access,
          alteration, disclosure, or destruction. However, no method of
          transmission over the Internet is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is
          active or as needed to provide the Service. We may also retain
          certain information as required by law or for legitimate business
          purposes.
        </p>

        <h2>7. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal information</li>
          <li>Object to or restrict processing of your information</li>
          <li>Request portability of your data</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at the email
          address below.
        </p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>
          The Service is not intended for children under 16. We do not
          knowingly collect personal information from children under 16. If we
          learn that we have collected information from a child under 16, we
          will take steps to delete it promptly.
        </p>

        <h2>9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your own. We ensure appropriate safeguards are in place
          to protect your information in accordance with this Privacy Policy.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the updated policy on this
          page with a revised &quot;Last updated&quot; date. Your continued use
          of the Service after changes constitutes acceptance of the updated
          policy.
        </p>

        <h2>11. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us
          at{" "}
          <a href="mailto:privacy@porygon.io">privacy@porygon.io</a>.
        </p>
      </div>
    </div>
  );
}
