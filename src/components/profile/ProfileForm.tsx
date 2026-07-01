'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/actions/profile.actions'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { Button } from '@/components/shared/Button'
import { CvUpload } from '@/components/profile/CvUpload'
import { WorkExperienceFields } from '@/components/profile/WorkExperienceFields'
import { EducationFields } from '@/components/profile/EducationFields'
import { SkillsInput } from '@/components/profile/SkillsInput'
import type { Profile, WorkExperienceEntry, EducationEntry } from '@/types/profile.types'
import type { CvParseResult } from '@/types/ai.types'

interface ProfileFormProps {
  initialProfile: Profile | null
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? '')
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date ?? '')
  const [location, setLocation] = useState(initialProfile?.location ?? '')
  const [headline, setHeadline] = useState(initialProfile?.headline ?? '')
  const [about, setAbout] = useState(initialProfile?.about ?? '')
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    (initialProfile?.work_experience as WorkExperienceEntry[] | undefined) ?? []
  )
  const [education, setEducation] = useState<EducationEntry[]>(
    (initialProfile?.education as EducationEntry[] | undefined) ?? []
  )
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills ?? [])
  const [languages, setLanguages] = useState<string[]>(initialProfile?.languages ?? [])
  const [isPending, startTransition] = useTransition()

  function applyCvParseResult(parsed: CvParseResult) {
    if (parsed.full_name) setFullName(parsed.full_name)
    if (parsed.birth_date) setBirthDate(parsed.birth_date)
    if (parsed.location) setLocation(parsed.location)
    if (parsed.headline) setHeadline(parsed.headline)
    if (parsed.about) setAbout(parsed.about)
    if (parsed.work_experience.length > 0) setWorkExperience(parsed.work_experience)
    if (parsed.education.length > 0) setEducation(parsed.education)
    if (parsed.skills.length > 0) setSkills(parsed.skills)
    if (parsed.languages.length > 0) setLanguages(parsed.languages)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    startTransition(async () => {
      const result = await updateProfile({
        fullName,
        birthDate,
        location,
        headline,
        about,
        workExperience,
        education,
        skills,
        languages,
      })
      if (result.error) {
        toast.error('Fehler beim Speichern.')
      } else {
        toast.success('Profil gespeichert.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <CvUpload onParsed={applyCvParseResult} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Vollständiger Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Geburtsdatum"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        <Input label="Ort" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input label="Kurzprofil" value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </div>

      <Textarea
        label="Über mich"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={4}
      />

      <WorkExperienceFields entries={workExperience} onChange={setWorkExperience} />
      <EducationFields entries={education} onChange={setEducation} />

      <SkillsInput label="Fähigkeiten" values={skills} onChange={setSkills} />
      <SkillsInput label="Sprachen" values={languages} onChange={setLanguages} />

      <div className="flex items-center gap-4">
        <Button type="submit" isLoading={isPending}>
          Profil speichern
        </Button>
      </div>
    </form>
  )
}
