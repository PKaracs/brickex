"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          Effective Date: March 14, 2026
        </p>

        <p className="text-zinc-400 mb-12 leading-relaxed">
          This Privacy Policy explains how Brickex (&quot;we&quot;,
          &quot;us&quot;, &quot;our&quot;) collects and uses information when you
          use{" "}
          <a
            href="https://brickex.co"
            className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            brickex.co
          </a>
          , our AI-powered real estate marketing platform.
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Email address</li>
                  <li>Name and account-related details</li>
                  <li>Business or agency information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Uploaded Content
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>
                    Property photos, floor plans, and other real estate images
                    you upload for processing
                  </li>
                  <li>Property details and descriptions you provide</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Payment Information
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Payments are processed by third-party providers</li>
                  <li>We do not store credit card details</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Usage & Analytics Data
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Pages visited</li>
                  <li>Actions taken</li>
                  <li>Device and browser data</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Cookies & Tracking
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>
                    Cookies and pixels for analytics and advertising (e.g. Meta,
                    Google)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              2. How We Use Information
            </h2>
            <p className="mb-2">We use information to:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Provide and operate our real estate marketing tools</li>
              <li>
                Generate AI-enhanced property images and marketing materials
              </li>
              <li>Manage subscriptions and payments</li>
              <li>Improve performance and user experience</li>
              <li>Communicate service-related updates</li>
              <li>Run analytics and advertising campaigns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              3. Property Images & Privacy
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>
                Uploaded property images are used only to provide the service
              </li>
              <li>We do not sell your uploaded images</li>
              <li>
                We do not publicly display your images without permission
              </li>
              <li>Images may be temporarily stored for processing</li>
              <li>
                We do not use your uploaded images to train AI models
              </li>
              <li>
                Uploaded images are automatically deleted after 30 days of
                inactivity
              </li>
              <li>
                You can request immediate deletion of your data at any time
                through email to{" "}
                <a
                  href="mailto:hello@brickex.co"
                  className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
                >
                  hello@brickex.co
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              4. Third-Party Services
            </h2>
            <p className="mb-2">We use trusted third parties for:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-3">
              <li>Payments</li>
              <li>Analytics</li>
              <li>Advertising</li>
              <li>AI image processing</li>
              <li>Hosting and infrastructure</li>
            </ul>
            <p className="text-zinc-500">
              These providers process data under their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-zinc-500">
              We take reasonable steps to protect your data, but no system is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              6. Your Rights
            </h2>
            <p className="mb-2">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 mb-3">
              <li>Access your data</li>
              <li>Request deletion</li>
              <li>Opt out of marketing emails</li>
            </ul>
            <p className="text-zinc-500">
              Contact{" "}
              <a
                href="mailto:hello@brickex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@brickex.co
              </a>{" "}
              for requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              7. Changes to This Policy
            </h2>
            <p className="text-zinc-500">
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">8. Contact</h2>
            <p className="text-zinc-500">
              For privacy questions:{" "}
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
