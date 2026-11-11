import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'
import { TypingHeadline } from '@/components/home/TypingHeadline'
import { TetrisBackground } from '@/components/home/TetrisBackground'
import { RecentSearches } from '@/components/home/RecentSearches'
import { ScrollShowcase } from '@/components/home/ScrollShowcase'
import { FaqSection } from '@/components/home/FaqSection'

const POPULAR_SEARCHES = [
  'Verkäufer',
  'Lagerhelfer',
  'Pflegefachkraft',
  'IT',
  'Ausbildung',
  'Home-Office',
]

export default function Home() {
  return (
    <main className="bg-background flex flex-1 flex-col">
      {/* Header ist exakt 4rem + 1px Border hoch. Hero füllt den restlichen
          Viewport vollständig, sodass die nächste Sektion erst beim Scrollen
          erscheint. lvh statt svh: svh ist die kleinste Viewport-Höhe (URL-Leiste
          ausgeklappt); ist die Leiste eingeklappt, ragte sonst die Trennlinie
          der nächsten Sektion ins Bild */}
      <Section className="relative flex min-h-[calc(100lvh-4rem-1px)] flex-col justify-center py-8 lg:py-12">
        <TetrisBackground />
        <Container className="relative">
          <TypingHeadline />

          <div className="mx-auto mt-6 max-w-4xl lg:mt-8">
            <JobSearchForm
              defaultWas=""
              defaultWo=""
              defaultUmkreis={25}
              popularSearches={POPULAR_SEARCHES}
            />
            <RecentSearches />
          </div>
        </Container>
      </Section>

      <ScrollShowcase />
      <FaqSection />
    </main>
  )
}
