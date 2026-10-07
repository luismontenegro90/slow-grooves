# Slow Grooves

Astro landing page, hosted on Sites, with a Sanity-managed record collection.

## Website

- `npm install` then `npm run dev`.
- `npm run build` exports the landing page to `dist/`.
- The collection contains the owner's supplied albums. English listening notes are editorial suggestions, not invented personal memories.
- Genre filtering and dedicated album pages work with saved or Sanity content.

## Connected Sanity project

Project: `ovzh9fkm`; dataset: `production` (public).
Studio: https://slow-grooves-vinyl.sanity.studio/

The Studio uses Sanity authentication. Edit records and click Publish; the landing fetches published changes on page load, using the current published data. The collection contains 20 albums.

## Reconfigure for another Sanity project

1. Sign in at https://www.sanity.io/manage and create a project with a **public** dataset named `production`. Project creation requires the owner's Sanity account.
2. Copy `.env.example` to `.env`, and set `PUBLIC_SANITY_PROJECT_ID` to the project ID.
3. In the project's API settings, allow the exact Site origin as a CORS origin, with **Allow credentials disabled** for this public read-only website. Also allow `http://127.0.0.1:4321` during development.
4. In `studio/`, copy `.env.example` to `.env` and set the same project ID. Run `npm install`, then `npm run dev`. Allow the exact Studio origin in Sanity CORS with credentials enabled for authenticated editing.
5. Add your records in Studio using the included `vinyl` schema. Set unique ranks 1–20, upload each album cover, and publish. Only published documents are queried. Studio is a separate authenticated Sanity application; it is not bundled into the public landing.
6. Rebuild and republish the Astro website once to embed the public project ID. Subsequent record edits are fetched directly from Sanity when the page loads, so they require no site deployment. CDN updates may take a short time.
7. Deploy the Studio with `npm run deploy` from `studio/` if you want Sanity-hosted editing.

No write token or secret is included in the website. Project ID and public dataset name are safe public identifiers. A private Sanity dataset needs a server-side proxy and secret, not a browser token.

## Data model

`rank`, `title`, `artist`, `year`, `genre`, `cover` (Sanity image), `note`, `favoriteTrack`.

Configured Sanity datasets replace the saved collection, including showing an empty collection when no published records exist. On network errors, the saved collection stays visible with a loading error message.

## Sources

Hero: optimized owner-supplied vinyl video. Ritual scenes: generated editorial images, optimized as WebP. Album covers were matched to the supplied albums through Apple Music metadata and uploaded into Sanity. The gallery renders Sanity-hosted assets.

Sanity API: https://www.sanity.io/docs/http-reference/query
CORS: https://www.sanity.io/docs/content-lake/cors
Astro static deployment: https://docs.astro.build/en/guides/deploy/

## Edition artwork

Moby is labeled Play (Deluxe Edition) as requested. The verified artwork used is from the original Play catalog listing; replace it in Studio with the owner's exact pressing cover if different.

## Album pages

Each of the twenty current albums has a dedicated `/albums/<artist-and-title>/` page, with a complete tracklist, official Spotify album embed, and credited reference photographs of a physical vinyl edition. Album details and photographs are editable in Sanity. Tracklist and photographed-pressing labels distinguish differing editions.

New records added in Studio appear in the collection immediately and open an individual `/albums/?id=<document-id>` listening page without needing a deployment. A subsequent Sites build gives new records a clean slug page too. Existing album data updates on page load directly from Sanity.

The Spotify iframe is loaded on the album page, with Spotify's standard media permissions and a direct album link. Playback availability depends on Spotify and the listener's session; the site does not control playback or claim it has started.

## Current website

https://slow-grooves-vinyl.lmontenegro.chatgpt.site

Full-width video hero, content constrained to 1440px, animated marquee, three ritual scenes and twenty album pages. Lenis provides smooth scrolling; the landing uses staggered text, while album pages use simple section fades. Reduced-motion preferences are respected.

GitHub stores the source. Publishing to GPT Sites is a separate operation; `.openai/hosting.json` identifies the existing Site.

The `vinyl` schema also includes `slug`, `spotifyUrl`, `tracklist`, `tracklistEdition`, `tracklistSource`, `vinylEdition` and `vinylPhotos`, with credits and source links. HUMAN MADE is a verified digital album; no physical pressing/photo was verified.

Local environment files, dependency folders and generated Studio runtime files are excluded. Studio scripts import/enrich content using an authorized Sanity CLI session. `finalize-details.mjs` is a historical script for the original twelve-album collection; review scripts before running them.
