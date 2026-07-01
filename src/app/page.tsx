import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'
import { TypingHeadline } from '@/components/home/TypingHeadline'

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
    <main className="bg-background flex flex-1 flex-col justify-center">
      <Section className="flex flex-col justify-center py-14 lg:py-20">
        <Container>
          <TypingHeadline />

          <div className="mx-auto mt-8 max-w-4xl">
            <JobSearchForm
              defaultWas=""
              defaultWo=""
              defaultUmkreis={25}
              popularSearches={POPULAR_SEARCHES}
            />
          </div>
        </Container>
      </Section>
    </main>
  )
}
