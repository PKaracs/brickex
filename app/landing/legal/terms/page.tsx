"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          Effective Date: March 14, 2026
        </p>

        <p className="text-zinc-400 mb-12 leading-relaxed">
          Welcome to Brickex (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
          By accessing or using{" "}
          <a
            href="https://brickex.co"
            className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            brickex.co
          </a>
          , you agree to these Terms & Conditions. If you do not agree, do not
          use the service.
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              1. Service Description
            </h2>
            <p className="mb-2">
              Brickex is an AI-powered real estate marketing platform that helps
              real estate professionals create enhanced property visuals,
              including virtual staging, image enhancement, and marketing
              materials from uploaded property photos.
            </p>
            <p className="text-zinc-500">
              Results may vary depending on inputs and usage. No specific
              outcome is guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              2. Eligibility
            </h2>
            <p className="text-zinc-500">
              You must be at least 18 years old to use Brickex.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              3. User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>You are responsible for all activity on your account</li>
              <li>You agree to provide accurate information</li>
              <li>You may not share or resell access to the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              4. User Content & Consent
            </h2>
            <p className="mb-3">
              You retain ownership of property photos and content you upload. By
              uploading content, you confirm that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-3">
              <li>You own the content or have explicit permission to use it</li>
              <li>
                You have the necessary rights or authorization to use the
                property images (e.g. as the property owner, agent, or
                photographer)
              </li>
              <li>
                The content does not infringe on any third-party intellectual
                property rights
              </li>
            </ul>
            <p className="text-zinc-500">
              You grant Brickex a limited license to process uploaded content
              only to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              5. Prohibited Content & Uses
            </h2>
            <p className="mb-2">
              You may not upload, generate, or attempt to create content that
              includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-4">
              <li>Illegal, harmful, or offensive material</li>
              <li>Content unrelated to real estate marketing purposes</li>
              <li>
                Images you do not have the right to use commercially
              </li>
            </ul>
            <p className="mb-2">
              You may not use Brickex or generated content to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Deceive, defraud, or mislead property buyers or renters</li>
              <li>
                Materially misrepresent the condition, size, or features of a
                property
              </li>
              <li>
                Create fraudulent property listings or advertisements
              </li>
              <li>Violate any applicable real estate advertising laws or regulations</li>
              <li>Harass or harm any individual</li>
              <li>Commit identity theft or any form of fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              6. Accurate Representation
            </h2>
            <p className="text-zinc-500 mb-3">
              While Brickex provides tools for enhancing property visuals and
              creating virtual staging, you are responsible for ensuring that the
              marketing materials you create do not materially misrepresent the
              property being marketed.
            </p>
            <p className="text-zinc-500">
              AI-generated enhancements should be used to showcase a
              property&apos;s potential, not to deceive prospective buyers or
              renters about the actual condition or features of a property. Where
              required by local law or regulation, you must disclose that images
              have been digitally enhanced or virtually staged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              7. Fair Use Policy
            </h2>
            <p className="mb-4">
              Brickex plans may be described as &quot;unlimited&quot; and are
              subject to fair use.
            </p>

            <h3 className="text-zinc-300 font-medium mb-2">
              What &quot;Unlimited&quot; Means
            </h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-4">
              <li>
                No fixed daily limit for normal professional use
              </li>
              <li>Designed for typical human usage, not automation</li>
            </ul>

            <h3 className="text-zinc-300 font-medium mb-2">
              Fair Use Threshold
            </h3>
            <p className="text-zinc-500 mb-2">
              To prevent abuse and ensure service quality:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-2">
              <li>
                Usage exceeding 300 generated images per billing period may be
                reviewed
              </li>
              <li>
                Excessive or automated use may result in temporary rate
                limiting, feature restriction, or account review
              </li>
            </ul>
            <p className="text-zinc-500 mb-4 text-sm">
              This threshold is well above normal usage and affects only extreme
              cases.
            </p>

            <h3 className="text-zinc-300 font-medium mb-2">Prohibited Usage</h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-4">
              <li>Automated or scripted generation</li>
              <li>Account sharing</li>
              <li>Reselling generated images as part of another service</li>
              <li>Attempts to overload or abuse the system</li>
            </ul>

            <p className="text-zinc-500">
              If you need higher volume, contact{" "}
              <a
                href="mailto:hello@brickex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@brickex.co
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              8. Payments & Subscriptions
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Paid plans are billed on a recurring basis</li>
              <li>Prices are shown clearly at checkout</li>
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation stops future billing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              9. Refund Policy
            </h2>
            <p className="mb-2">Unless required by law:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Payments are non-refundable</li>
              <li>You may cancel at any time to avoid future charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              10. User Responsibility for Generated Content
            </h2>
            <p className="text-zinc-500 mb-3">
              You are solely responsible for all content you generate using
              Brickex and how you use, share, or distribute that content in
              property listings, advertisements, or other marketing materials.
            </p>
            <p className="text-zinc-500 mb-3">
              Brickex is not responsible for any claims, damages, or legal
              issues arising from your use of generated images, including but
              not limited to misrepresentation, misleading advertising, or
              intellectual property infringement.
            </p>
            <p className="text-zinc-500">
              By using this service, you agree to indemnify and hold harmless
              Brickex from any claims resulting from your use of generated
              content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              11. AI-Generated Content Disclaimer
            </h2>
            <p className="text-zinc-500 mb-3">
              All enhanced images and virtual staging created through Brickex are
              AI-generated. They represent a visualization of potential and do
              not necessarily reflect the current state of a property.
            </p>
            <p className="text-zinc-500">
              Users acknowledge that generated images may contain
              inaccuracies or artifacts. Brickex makes no representations
              about the accuracy of any generated content. It is the
              user&apos;s responsibility to review all output before publishing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              12. Disclaimer
            </h2>
            <p className="text-zinc-500">
              Brickex is provided &quot;as is&quot; without warranties of any
              kind. We do not guarantee specific results or outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              13. Limitation of Liability
            </h2>
            <p className="text-zinc-500">
              To the maximum extent permitted by law, Brickex is not liable for
              indirect, incidental, or consequential damages arising from use of
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              14. Termination
            </h2>
            <p className="text-zinc-500">
              We reserve the right to suspend or terminate accounts that violate
              these Terms or misuse the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              15. Changes to Terms
            </h2>
            <p className="text-zinc-500">
              We may update these Terms at any time. Continued use of the
              service constitutes acceptance of updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              16. Governing Law
            </h2>
            <p className="text-zinc-500">
              These Terms are governed by the laws of the EU.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">17. Contact</h2>
            <p className="text-zinc-500">
              For questions or support:{" "}
              <a
                href="mailto:hello@brickex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@brickex.co
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
