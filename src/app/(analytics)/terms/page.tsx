export const metadata = {
  title: "Terms of Service",
  description: "Warmlo terms of service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 md:px-8">
      <h1 className="font-serif text-[30px] font-bold text-ink-900 md:text-[40px]">
        Terms of Service
      </h1>
      <div className="mt-8 space-y-4 text-base text-ink-700">
        <p>Last updated: July 2026</p>
        <p>
          By using Warmlo, you agree to these terms. Warmlo provides informational content
          about HVAC error codes and repair costs. We are not a licensed contractor and do not
          perform repairs.
        </p>
        <h2 className="font-serif text-2xl font-bold text-ink-900">No professional advice</h2>
        <p>
          Content on Warmlo is for general informational purposes only. Gas, electrical, and
          combustion work can be dangerous. Always consult a licensed technician for repairs.
        </p>
        <h2 className="font-serif text-2xl font-bold text-ink-900">Third-party services</h2>
        <p>
          When you request quotes, we may share your information with partner contractor networks.
          Those partners have their own terms and privacy policies.
        </p>
        <h2 className="font-serif text-2xl font-bold text-ink-900">Limitation of liability</h2>
        <p>
          Warmlo is provided &quot;as is&quot; without warranties. We are not liable for damages
          arising from use of our site or reliance on our content.
        </p>
      </div>
    </div>
  );
}
