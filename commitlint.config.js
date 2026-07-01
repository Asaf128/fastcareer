// subject-case deaktiviert: deutsche Commit-Messages (Substantive werden großgeschrieben)
// sind sonst mit dem default start-case/sentence-case-Verbot von config-conventional inkompatibel.
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: { 'subject-case': [0] },
}

export default config
