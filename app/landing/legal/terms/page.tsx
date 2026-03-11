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
          Effective Date: December 10, 2025
        </p>

        <p className="text-zinc-400 mb-12 leading-relaxed">
          Welcome to Richflex ("we", "us", "our"). By accessing or using{" "}
          <a
            href="https://richflex.co"
            className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            richflex.co
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
              Richflex provides an AI-powered photo generation service that
              allows users to generate images based on photos they upload.
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
              You must be at least 18 years old to use Richflex.
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
              You retain ownership of photos you upload. By uploading content,
              you confirm that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-3">
              <li>You own the content or have explicit permission to use it</li>
              <li>
                You have the consent of all individuals appearing in the images
              </li>
              <li>You are not impersonating another person</li>
            </ul>
            <p className="text-zinc-500">
              You grant Richflex a limited license to process uploaded content
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
              <li>NSFW or explicit sexual content</li>
              <li>Pornographic or fetish content</li>
              <li>Sexual nudity or sexual acts</li>
              <li>Violence, hate, or illegal material</li>
            </ul>
            <p className="mb-2">
              You may not use Richflex or generated content to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Deceive, defraud, or scam others</li>
              <li>Create fake profiles, catfish, or impersonate others</li>
              <li>
                Spread misinformation or present AI images as real photographs
              </li>
              <li>Harass, stalk, or harm any individual</li>
              <li>Commit identity theft or any form of fraud</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              6. Celebrity & Public Figure Policy
            </h2>
            <p className="mb-2">You may not upload or generate images of:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-3">
              <li>Celebrities</li>
              <li>Public figures</li>
              <li>Influencers</li>
              <li>Real individuals other than yourself</li>
            </ul>
            <p className="text-zinc-500 mb-2">
              Unless you have explicit permission or legal rights to do so.
            </p>
            <p className="text-zinc-500 text-sm">
              Content that violates this rule may be removed without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              7. Fair Use Policy
            </h2>
            <p className="mb-4">
              Richflex plans may be described as "unlimited" and are subject to
              fair use.
            </p>

            <h3 className="text-zinc-300 font-medium mb-2">
              What "Unlimited" Means
            </h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-4">
              <li>
                No fixed daily limit for normal personal or professional use
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
                href="mailto:hello@richflex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@richflex.co
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
              Richflex and how you use, share, or distribute that content.
            </p>
            <p className="text-zinc-500 mb-3">
              Richflex is not responsible for any claims, damages, or legal
              issues arising from your use of generated images, including but
              not limited to defamation, fraud, misrepresentation, or
              intellectual property infringement.
            </p>
            <p className="text-zinc-500">
              By using this service, you agree to indemnify and hold harmless
              Richflex from any claims resulting from your use of generated
              content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              11. AI-Generated Content Disclaimer
            </h2>
            <p className="text-zinc-500 mb-3">
              All images created through Richflex are AI-generated and
              fictional. They do not represent real events, real wealth, real
              possessions, or real circumstances.
            </p>
            <p className="text-zinc-500">
              Users acknowledge that generated images may contain errors,
              inaccuracies, or artifacts. Richflex makes no representations
              about the accuracy or realism of any generated content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              12. Disclaimer
            </h2>
            <p className="text-zinc-500">
              Richflex is provided "as is" without warranties of any kind. We do
              not guarantee specific results or outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              13. Limitation of Liability
            </h2>
            <p className="text-zinc-500">
              To the maximum extent permitted by law, Richflex is not liable for
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
                href="mailto:hello@richflex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@richflex.co
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
