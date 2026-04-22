import alleyPhoto from "@/assets/photo-alley.jpg";
import dunesPhoto from "@/assets/photo-dunes.jpg";
import elephantPhoto from "@/assets/photo-elephant.jpg";
import mountainRoadPhoto from "@/assets/photo-mountain-road.jpg";

const featuredShots = [
  {
    src: alleyPhoto,
    alt: "Golden hour light passing through a narrow Mediterranean alley.",
    title: "Quiet Light",
    detail: "Street study · Golden hour",
    orientation: "portrait",
  },
  {
    src: elephantPhoto,
    alt: "Elephant walking through warm savannah light with dust in the air.",
    title: "Savannah Passage",
    detail: "Wildlife · Golden hour",
    orientation: "landscape",
  },
  {
    src: mountainRoadPhoto,
    alt: "Winding mountain road overlooking a dramatic valley at sunrise.",
    title: "Road Into Silence",
    detail: "Travel · Mountain route",
    orientation: "portrait",
  },
  {
    src: dunesPhoto,
    alt: "Soft coastal dunes with grasses beside a calm sea.",
    title: "Tide Line",
    detail: "Travel · Coastline",
    orientation: "landscape",
  },
];

const Index = () => {
  return (
    <main className="portfolio-shell min-h-screen">
      <section className="border-b border-border/70 px-6 py-8 sm:px-10 lg:px-14">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="section-label">Photography portfolio</p>
            <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none text-balance sm:text-6xl lg:text-7xl">
              Images shaped by stillness, light, and intention.
            </h1>
          </div>
          <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href="mailto:hello@studio.com">
            hello@studio.com
          </a>
        </div>
      </section>

      <section className="px-6 pb-10 pt-12 sm:px-10 lg:px-14 lg:pb-14 lg:pt-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div className="space-y-8">
            <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A minimal collection of wildlife encounters and slow travel moments, shaped for clients who value atmosphere without excess.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="contact-chip">Wildlife</span>
              <span className="contact-chip">Travel</span>
              <span className="contact-chip">Editorial</span>
            </div>
          </div>

          <div className="grid gap-6 rounded-md border border-border/70 bg-surface p-6 shadow-soft sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <p className="section-label">Approach</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Quiet observation, natural color, and clean composition designed to keep the focus on place, movement, and presence.
              </p>
            </div>
            <div>
              <p className="section-label">Availability</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Select tourism campaigns, safari lodges, editorial features, and private commissions.
              </p>
            </div>
            <div className="animate-drift motion-reduce:animate-none">
              <p className="section-label">Based in</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">Available worldwide for wildlife expeditions and thoughtful travel stories.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-12 sm:px-10 lg:px-14 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="section-label">Selected work</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">A calm, client-facing edit.</h2>
            </div>
            <p className="hidden max-w-sm text-sm leading-7 text-muted-foreground md:block">
              Simple, immersive presentation lets the landscapes and wildlife lead while the page stays polished and memorable.
            </p>
          </div>

          <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[84px]">
            {featuredShots.map((shot, index) => {
              const layout =
                index === 0
                  ? "sm:col-span-2 lg:col-span-5 lg:row-span-5"
                  : index === 1
                    ? "lg:col-span-7 lg:row-span-3"
                    : index === 2
                      ? "lg:col-span-4 lg:row-span-5"
                      : "lg:col-span-8 lg:row-span-2";

              return (
                <article className={`image-frame group ${layout}`} key={shot.title}>
                  <img
                    alt={shot.alt}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    height={shot.orientation === "portrait" ? 1920 : 1024}
                    loading={index === 0 ? "eager" : "lazy"}
                    src={shot.src}
                    width={shot.orientation === "portrait" ? 1080 : 1024}
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    <div>
                      <h3 className="font-sans text-lg font-semibold">{shot.title}</h3>
                      <p className="text-sm text-primary-foreground/80">{shot.detail}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-card/50 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label">For inquiries</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-balance sm:text-5xl">
              For clients who want thoughtful visuals that linger.
            </h2>
          </div>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Share your destination, season, and the kind of story you want your audience to remember.</p>
            <a className="inline-flex items-center border-b border-foreground/20 pb-1 text-foreground transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href="mailto:hello@studio.com?subject=Photography%20Inquiry">
              Start a conversation
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
