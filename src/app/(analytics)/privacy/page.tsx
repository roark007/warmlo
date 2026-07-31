export const metadata = {
  title: "Privacy Policy",
  description: "Warmlo privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 md:px-8">
      <h1 className="font-serif text-[30px] font-bold text-ink-900 md:text-[40px]">
        Privacy Policy
      </h1>
      <div className="prose-mt mt-8 space-y-4 text-base text-ink-700">
        <p>Last updated: July 2026</p>
        <p>
          Warmlo (&quot;we,&quot; &quot;us&quot;) operates warmlo.com. This policy describes how we
          collect, use, and share information when you use our website.
        </p>
        <h2 className="font-serif text-2xl font-bold text-ink-900">Information we collect</h2>
        <p>
          When you submit a quote request form, we collect your name, ZIP code, phone number,
          email address, and project details. We also collect standard web analytics data such
          as pages visited and referral source.
        </p>
        <h2 className="font-serif text-2xl font-bold text-ink-900">How we use information</h2>
        <p>
          We use your information to connect you with local HVAC professionals and to improve
          our services. We do not sell your personal information to third parties for their
          marketing purposes.
        </p>
        <h2 className="font-serif text-2xl font-bold text-ink-900">Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:privacy@warmlo.com" className="text-pilot-600 underline">
            privacy@warmlo.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
