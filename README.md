# UnihackBrandMuse — platformă B2B pentru colaborare creativă

Ce este: un hub unde companiile descoperă artiști, freelanceri și influenceri, pornesc proiecte vizuale, discută în timp real, semnează contracte și urmăresc totul într-un singur loc (brief → colaborare → livrabile → plată).

Ce poate face platforma:

Descoperire & căutare: profiluri/portofolii filtrabile, căutare rapidă după skill, industrie, buget, disponibilitate.

Proiecte end-to-end: brief, ofertare, milestones, fișiere, chat, calendar/booking.

Contracte & conformitate: șabloane, semnare electronică, istoric audit.

Plăți (opțional): comision/escrow, facturi, rapoarte.

Reputație: rating & review pe proiecte, scoruri de calitate.

Notificări: email + push, mențiuni, schimbări de status.

Roluri și permisiuni

Admin – guvernanță, moderare, metrici globale, gestionare comisioane.

Company – creează briefuri, contracte, plăți, echipe interne.

Artist/Freelancer – portofoliu, ofertare, calendar, livrabile.
RBAC este aplicat la nivel de rută, API și date.

Arhitectură (cum e construit)
Frontend / Web app

Next.js (React) cu SSR/SSG pentru pagini publice rapide (SEO) și routing file-based; API Routes pentru endpoint-uri ușoare.

TypeScript peste tot pentru tipare stricte și autocomplete solid.

UI: Tailwind CSS + shadcn/ui (butoane, carduri, dialoguri) → coerență vizuală + velocity.

Formulare: react-hook-form + Zod (validare tipată, erori clare).

Data fetching & cache: TanStack Query (cache, revalidare, optimistic updates).

Autentificare & Autorizare

Clerk sau Auth.js pentru email/OAuth; sesiuni sigure, MFA opțional.

RBAC pe roluri (admin/company/artist) + guards la nivel de API.

Backend & Date

PostgreSQL pe Supabase sau Neon; Prisma ca ORM (migrări, tipare generate).

Chat în timp real: Socket.IO (self-host) sau Pusher/Ably (managed), cu livrare fallback.

Stocare fișiere: S3/R2 (upload via uploadthing) sau Supabase Storage pentru portofolii, imagini, PDF-uri.

Căutare: Meilisearch (self-host) sau Algolia pentru query-uri full-text asupra profilurilor și proiectelor.

Plăți: Stripe (checkout, comisioane, escrow, webhooks).

Contracte: DocuSign/Dropbox Sign sau Documenso (open-source) pentru semnare.

Calendar & booking: Cal.com embed; sincronizare prin webhooks.

Email & notificări: Resend (email) + FCM/OneSignal (push).

Observabilitate: Sentry (erori) + PostHog (analytics, funnels).

Cache & rate-limit: Upstash Redis (throttling, sesiuni volatile, queue ușoare).

Deploy & operare

Vercel pentru web (SSR/Edge, previzualizări PR).

Railway/Render pentru servicii auxiliare (chat, workers/queue).

Migrații Prisma automatizate în pipeline; environment-uri izolate.

Securitate & bune practici

Validare dublă Zod (client + API) și schema-driven forms.

S3 pre-signed URLs, antivirus la upload (opțional), versiuni fișiere.

Webhooks semnate (Stripe, Cal.com, semnare).

Coloană audit (createdBy/updatedBy), soft-delete, row-level security unde e cazul.

Backup DB automat + rotația cheilor/secrets.

Fluxuri cheie (MVP)

Onboarding: OAuth/email → alegere rol → setup profil/portofoliu.

Publicare brief: compania definește buget, deadline, skilluri → primește match-uri.

Invitații & ofertare: chat + atașamente, propuneri de milestones.

Contract & semnare: template → semnare → generare PDF → arhivare.

Calendar & livrare: programare sesiuni prin Cal.com, livrabile în fișiere.

Plată & review: Stripe capture/escrow → marcare “complete” → rating bidirecțional.
