# SOL LINK A/B Pilot Prototype

Mobile A/B test pilot for **Type A** vs **Type B** landing pages from your Figma design.

## Features

- **50:50 random** variant assignment (sticky per browser session)
- **Section dwell time** via Intersection Observer
- **CTA click** tracking (all buttons)
- **Back button** tracking (header + browser back)
- **Total session time** + max scroll depth
- **Full-screen mobile** via PWA (`display: standalone`)
- **Admin dashboard** at `/admin.html` with CSV export
- **Supabase** backend (free tier) for multi-user data collection

## Quick start (local)

```bash
cd sollinkAB
python3 -m http.server 8080
```

Open on your phone (same Wi‑Fi):

```
http://YOUR_COMPUTER_IP:8080
```

Force a variant for testing:

```
http://localhost:8080/?variant=A
http://localhost:8080/?variant=B
```

## Deploy with a **private** GitHub repo (recommended for you)

Your coworkers only need the **live URL** — they never see the GitHub repo. Keep the repo private and deploy with one of these (all free):

### Option A: Vercel (easiest)

1. Push this folder to a **private** GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your private repo (grant Vercel access to that repo only)
4. Leave **Framework Preset**: Other, **Root Directory**: `.`, **Build Command**: empty
5. Deploy → you get a URL like `https://sollink-ab-pilot.vercel.app`
6. Share that URL with coworkers

Redeploys automatically on every `git push`.

### Option B: Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Connect private GitHub repo
3. Build command: *(none)* · Output directory: `/`
4. Deploy and share the `*.pages.dev` URL

### Option C: Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Connect private repo (uses `netlify.toml` in this project)
3. Deploy and share the `*.netlify.app` URL

### What stays private vs shared

| | Coworkers with link | Random public |
|--|---------------------|---------------|
| GitHub repo (source code) | **Hidden** | **Hidden** |
| Live prototype URL | Can open | Can open if they guess URL* |
| Admin dashboard | Can open (needs password) | Same |

\* URLs are unlisted, not secret. For stricter access, enable **password protection** on Vercel/Netlify (paid) or share only on internal channels.

---

## Deploy to GitHub Pages (public repo only)

GitHub **Free** requires a **public** repo for Pages. Skip this if the repo must stay private.

1. Create a new GitHub repo (e.g. `sollink-ab-pilot`)
2. Push this folder:

```bash
git init
git add .
git commit -m "Add SOL LINK A/B pilot prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sollink-ab-pilot.git
git push -u origin main
```

3. In GitHub → **Settings → Pages → Source**: deploy from `main` / root
4. Your live URLs:

```
https://YOUR_USERNAME.github.io/sollink-ab-pilot/
https://YOUR_USERNAME.github.io/sollink-ab-pilot/admin.html
```

Share the first link with testers.

## Set up data collection (Supabase — recommended)

Without Supabase, sessions are stored **locally on each device** only. For a real pilot, set up Supabase (free):

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in **SQL Editor**
3. Copy **Project URL** and **anon public key** from Settings → API
4. Edit `js/config.js`:

```js
window.SOLLINK_CONFIG = {
  supabaseUrl: 'https://xxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbG...',
  adminPassword: 'your-secure-password',
};
```

5. Open `admin.html`, log in, click **Refresh**

## Full-screen on iPhone / Android

1. Open the prototype URL in **Safari** (iOS) or **Chrome** (Android)
2. **Add to Home Screen**
3. Launch from the home screen icon → runs without browser chrome

## Tracked sections

| Section ID | Content |
|-----------|---------|
| `topBanner` | Hero banner |
| `productDesc` | Product intro (A: image / B: card layout) |
| `benefit1` | Tesla event section |
| `benefit2` | Million-won event section |
| `commission` | Fee benefit section |
| `contentContainer` | Bottom nav area |
| `disclaimer` | 알아두세요 |

## Tracked CTAs

- SOL LINK 개설하기 / SOL LINK 자세히 보기
- 투자쿠폰 받고 테슬라 응모하기
- 테슬라 당첨 결과 보기
- 최대 100만원 도전하기
- 수수료 혜택 신청하기

## Admin dashboard

URL: `/admin.html`

Default password: `sollink-pilot-2026` (change in `js/config.js`)

Shows:
- Session count by variant
- Average time on page
- Back button rate
- CTA click counts
- Per-section average dwell time
- CSV export

## File structure

```
index.html          # Prototype entry
admin.html          # Analytics dashboard
js/analytics.js     # Tracking engine
js/app.js           # Renders Type A / B
js/config.js        # Supabase + admin password
assets/a/           # Type A images
assets/b/           # Type B images
manifest.json       # PWA config
supabase/schema.sql # Database setup
```

## Notes

- Figma asset URLs expire after ~7 days — images are bundled locally in `assets/`
- For production, restrict Supabase RLS policies (current setup is pilot-friendly)
- `?variant=A|B` overrides random assignment for QA
