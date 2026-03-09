import SimpleHeader from "@/pages/landing/components/simple-header";
import SimpleHero from "@/pages/landing/components/simple-hero";
import KeyFeatures from "@/pages/landing/components/key-features";
import DocumentationCTA from "@/pages/landing/components/documentation-cta";
import SimpleFooter from "@/pages/landing/components/simple-footer";

export default function PokayokeLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <SimpleHeader />

      <main className="flex-1">
        <SimpleHero />
        <KeyFeatures />
        <DocumentationCTA />
      </main>

      <SimpleFooter />
    </div>
  );
}
