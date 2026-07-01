export default function Home() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-text-secondary mb-4 text-xs tracking-[0.4em] uppercase">Template</p>
        <h1 className="text-foreground text-6xl sm:text-7xl lg:text-8xl">Starter</h1>
        <div className="bg-accent mx-auto mt-6 h-px w-16" />
        <p className="text-text-secondary mt-6">
          Bereit loszulegen. Ersetze diese Seite mit deinem Content.
        </p>
      </div>
    </main>
  )
}
