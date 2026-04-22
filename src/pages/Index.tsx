import { useEffect, useMemo, useState } from "react";

import alleyPhoto from "@/assets/photo-alley.jpg";
import dunesPhoto from "@/assets/photo-dunes.jpg";
import elephantPhoto from "@/assets/photo-elephant.jpg";
import mountainRoadPhoto from "@/assets/photo-mountain-road.jpg";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(255, "Email is too long."),
  location: z.string().trim().min(2, "Add a location or destination.").max(120, "Location is too long."),
  message: z.string().trim().min(20, "Please share a few more details.").max(1000, "Message is too long."),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

type PortfolioPhoto = Tables<"portfolio_photos">;

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255, "Email is too long."),
});

const uploadSchema = z.object({
  title: z.string().trim().min(2, "Add a title.").max(160, "Title is too long."),
  location: z.string().trim().max(160, "Location is too long.").optional().or(z.literal("")),
  caption: z.string().trim().max(1000, "Caption is too long.").optional().or(z.literal("")),
  file: z
    .custom<FileList>((value) => value instanceof FileList && value.length > 0, "Choose one image.")
    .refine((files) => files.length === 1, "Upload one image at a time.")
    .refine((files) => files[0]?.size <= 10 * 1024 * 1024, "Image must be 10MB or less.")
    .refine((files) => ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type), "Use JPG, PNG, or WEBP."),
});

type AuthFormValues = z.infer<typeof authSchema>;
type UploadFormValues = z.infer<typeof uploadSchema>;

const instagramUrl = "https://instagram.com/meshxshacky";
const phoneDisplay = "+254743511196";
const phoneHref = "tel:+254743511196";

const Index = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
      message: "",
    },
  });

  const {
    register: registerAuth,
    handleSubmit: handleAuthSubmit,
    reset: resetAuth,
    formState: { errors: authErrors, isSubmitting: isSendingLink },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "" },
  });

  const {
    register: registerUpload,
    handleSubmit: handleUploadSubmit,
    reset: resetUpload,
    formState: { errors: uploadErrors, isSubmitting: isUploading },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      location: "",
      caption: "",
    },
  });

  const loadPhotos = async () => {
    setIsLoadingPhotos(true);
    const { data, error } = await supabase
      .from("portfolio_photos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Could not load photos", { description: error.message });
    } else {
      setPhotos(data ?? []);
    }

    setIsLoadingPhotos(false);
  };

  useEffect(() => {
    void loadPhotos();

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionEmail(session?.user.email ?? null);
      setOwnerId(session?.user.id ?? null);
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      setOwnerId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayedShots = useMemo(() => {
    if (!photos.length) {
      return featuredShots;
    }

    return photos
      .filter((photo) => photo.is_published)
      .slice(0, 6)
      .map((photo, index) => ({
        src: photo.image_url,
        alt: photo.caption || `${photo.title}${photo.location ? ` in ${photo.location}` : ""}`,
        title: photo.title,
        detail: photo.location ? `Travel · ${photo.location}` : index % 2 === 0 ? "Wildlife · Uploaded" : "Travel · Uploaded",
        orientation: index % 3 === 0 ? "portrait" : "landscape",
      }));
  }, [photos]);

  const onSubmit = async (values: InquiryFormValues) => {
    const inquiryPayload = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      location: values.location.trim(),
      message: values.message.trim(),
    };

    const safePreview = encodeURIComponent(
      `Photo shoot inquiry\nName: ${inquiryPayload.name}\nEmail: ${inquiryPayload.email}\nLocation: ${inquiryPayload.location}\nDetails: ${inquiryPayload.message}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 650));
    setIsSubmitted(true);
    reset();
    toast.success("Inquiry sent", {
      description: "Your photo shoot request is ready for follow-up.",
    });

    void safePreview;
  };

  const onSendSignInLink = async (values: AuthFormValues) => {
    const email = values.email.trim();
    const redirectTo = window.location.href;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      toast.error("Could not send sign-in link", { description: error.message });
      return;
    }

    resetAuth();
    toast.success("Sign-in link sent", {
      description: "Open the email on your phone or laptop to access the upload manager.",
    });
  };

  const onUploadPhoto = async (values: UploadFormValues) => {
    if (!ownerId) {
      toast.error("Please sign in first.");
      return;
    }

    const file = values.file[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeFileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${ownerId}/${safeFileName}`;

    const { error: uploadError } = await supabase.storage.from("portfolio-photos").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      return;
    }

    const { data: publicData } = supabase.storage.from("portfolio-photos").getPublicUrl(storagePath);

    const nextSortOrder = photos.length ? Math.max(...photos.map((photo) => photo.sort_order)) + 1 : 0;
    const payload = {
      user_id: ownerId,
      title: values.title.trim(),
      location: values.location?.trim() || null,
      caption: values.caption?.trim() || null,
      image_path: storagePath,
      image_url: publicData.publicUrl,
      sort_order: nextSortOrder,
      is_published: true,
    };

    const { error: insertError } = await supabase.from("portfolio_photos").insert(payload);

    if (insertError) {
      await supabase.storage.from("portfolio-photos").remove([storagePath]);
      toast.error("Photo details could not be saved", { description: insertError.message });
      return;
    }

    resetUpload();
    toast.success("Photo uploaded", { description: "Your new image is now part of the portfolio." });
    await loadPhotos();
  };

  const handleDeletePhoto = async (photo: PortfolioPhoto) => {
    const { error: deleteRowError } = await supabase.from("portfolio_photos").delete().eq("id", photo.id);

    if (deleteRowError) {
      toast.error("Could not remove photo", { description: deleteRowError.message });
      return;
    }

    const { error: deleteFileError } = await supabase.storage.from("portfolio-photos").remove([photo.image_path]);

    if (deleteFileError) {
      toast.error("Photo removed from portfolio, but file cleanup failed", { description: deleteFileError.message });
    } else {
      toast.success("Photo removed");
    }

    await loadPhotos();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Could not sign out", { description: error.message });
      return;
    }

    toast.success("Signed out");
  };

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
          <div className="flex flex-wrap items-center justify-end gap-3">
            <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={instagramUrl} rel="noreferrer" target="_blank">
              @meshxshacky
            </a>
            <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={phoneHref}>
              {phoneDisplay}
            </a>
          </div>
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
            {displayedShots.map((shot, index) => {
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

      <section className="border-t border-border/70 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(380px,1fr)]">
          <div>
            <p className="section-label">Upload manager</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-balance sm:text-5xl">
              Add your own wildlife and travel images anytime.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>Use a secure email sign-in link to open your private uploader, add a title and location, and publish photos directly to the portfolio.</p>
              <p>Accepted files: JPG, PNG, WEBP up to 10MB each.</p>
            </div>
          </div>

          <div className="space-y-5 rounded-md border border-border/70 bg-surface p-6 shadow-soft">
            {sessionEmail ? (
              <>
                <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="section-label">Signed in</p>
                    <p className="mt-2 text-sm text-foreground">{sessionEmail}</p>
                  </div>
                  <Button onClick={handleSignOut} type="button" variant="outline">
                    Sign out
                  </Button>
                </div>

                <form className="space-y-5" noValidate onSubmit={handleUploadSubmit(onUploadPhoto)}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="section-label" htmlFor="photo-title">
                        Title
                      </label>
                      <Input id="photo-title" maxLength={160} placeholder="Savannah Morning" {...registerUpload("title")} />
                      {uploadErrors.title ? <p className="text-sm text-destructive">{uploadErrors.title.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <label className="section-label" htmlFor="photo-location">
                        Location
                      </label>
                      <Input id="photo-location" maxLength={160} placeholder="Masai Mara" {...registerUpload("location")} />
                      {uploadErrors.location ? <p className="text-sm text-destructive">{uploadErrors.location.message}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="section-label" htmlFor="photo-caption">
                      Caption
                    </label>
                    <Textarea id="photo-caption" maxLength={1000} placeholder="A short line about the moment, species, or landscape." {...registerUpload("caption")} />
                    {uploadErrors.caption ? <p className="text-sm text-destructive">{uploadErrors.caption.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="section-label" htmlFor="photo-file">
                      Image file
                    </label>
                    <Input accept="image/jpeg,image/png,image/webp" id="photo-file" type="file" {...registerUpload("file")} />
                    {uploadErrors.file ? <p className="text-sm text-destructive">{uploadErrors.file.message as string}</p> : null}
                  </div>

                  <div className="flex justify-end">
                    <Button disabled={isUploading} type="submit">
                      {isUploading ? "Uploading..." : "Upload photo"}
                    </Button>
                  </div>
                </form>

                <div className="space-y-4 border-t border-border/70 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="section-label">Your uploaded photos</p>
                    <p className="text-sm text-muted-foreground">{photos.length} total</p>
                  </div>

                  {isLoadingPhotos ? (
                    <p className="text-sm text-muted-foreground">Loading your portfolio images…</p>
                  ) : photos.length ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {photos.map((photo) => (
                        <article className="image-frame group" key={photo.id}>
                          <img alt={photo.caption || photo.title} className="h-52 w-full object-cover" loading="lazy" src={photo.image_url} />
                          <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-4 text-primary-foreground">
                            <div>
                              <h3 className="text-base font-semibold">{photo.title}</h3>
                              <p className="text-sm text-primary-foreground/80">{photo.location || "Published on portfolio"}</p>
                            </div>
                            <Button onClick={() => void handleDeletePhoto(photo)} size="sm" type="button" variant="secondary">
                              Remove
                            </Button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Your uploaded photos will appear here after the first upload.</p>
                  )}
                </div>
              </>
            ) : (
              <form className="space-y-5" noValidate onSubmit={handleAuthSubmit(onSendSignInLink)}>
                <div className="space-y-2">
                  <label className="section-label" htmlFor="owner-email">
                    Owner email
                  </label>
                  <Input id="owner-email" maxLength={255} placeholder="your@email.com" type="email" {...registerAuth("email")} />
                  {authErrors.email ? <p className="text-sm text-destructive">{authErrors.email.message}</p> : null}
                </div>

                <p className="text-sm leading-7 text-muted-foreground">
                  We’ll send a secure sign-in link so only you can upload and manage portfolio photos.
                </p>

                <div className="flex justify-end">
                  <Button disabled={isSendingLink} type="submit">
                    {isSendingLink ? "Sending link..." : "Email me a sign-in link"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-card/50 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,1fr)] lg:items-start">
          <div>
            <p className="section-label">For inquiries</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-balance sm:text-5xl">
              For clients who want thoughtful visuals that linger.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>Share your destination, season, and the kind of story you want your audience to remember.</p>
              <div className="flex flex-wrap gap-3">
                <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={instagramUrl} rel="noreferrer" target="_blank">
                  Instagram · meshxshacky
                </a>
                <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={phoneHref}>
                  Call · {phoneDisplay}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/70 bg-surface p-6 shadow-soft">
            {isSubmitted ? (
              <div className="space-y-4">
                <p className="section-label">Success</p>
                <h3 className="font-display text-3xl">Inquiry received.</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  Thanks for reaching out about your shoot. You can also follow up directly on Instagram or by phone for a faster response.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={instagramUrl} rel="noreferrer" target="_blank">
                    Open Instagram
                  </a>
                  <a className="contact-chip transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={phoneHref}>
                    Call now
                  </a>
                </div>
                <Button
                  className="mt-2"
                  onClick={() => setIsSubmitted(false)}
                  type="button"
                >
                  Send another inquiry
                </Button>
              </div>
            ) : (
              <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="section-label" htmlFor="name">
                      Name
                    </label>
                    <Input id="name" maxLength={100} placeholder="Your name" {...register("name")} />
                    {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <label className="section-label" htmlFor="email">
                      Email
                    </label>
                    <Input id="email" maxLength={255} placeholder="you@example.com" type="email" {...register("email")} />
                    {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="section-label" htmlFor="location">
                    Shoot location
                  </label>
                  <Input id="location" maxLength={120} placeholder="Masai Mara, Zanzibar, Nairobi…" {...register("location")} />
                  {errors.location ? <p className="text-sm text-destructive">{errors.location.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="section-label" htmlFor="message">
                    Project details
                  </label>
                  <Textarea
                    id="message"
                    maxLength={1000}
                    placeholder="Tell me about the type of shoot, timing, number of days, and the mood you want captured."
                    {...register("message")}
                  />
                  {errors.message ? <p className="text-sm text-destructive">{errors.message.message}</p> : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-muted-foreground">A confirmation state will appear here once your inquiry is submitted.</p>
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Sending..." : "Send inquiry"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
