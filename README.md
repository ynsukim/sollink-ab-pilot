# SOL LINK A/B Pilot Prototype

Mobile A/B test pilot for **Type A** vs **Type B** landing pages.

## What you need for a real multi-phone pilot

1. **Live URL** (Vercel) — coworkers open the same link on their phones  
2. **Supabase** (free) — all sessions go to one shared database  
3. **Admin** — compare Type A vs B, archive old rounds, reset for a new test

---

## 1. Deploy live (Vercel)

```bash
cd sollinkAB
git add .
git commit -m "Prepare live A/B pilot with archive reset"
git push
```

1. [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo  
2. **Framework**: Other · **Root**: `.` · **Build command**: `npm run build` · **Output**: `.`  
3. Deploy → share URL, e.g. `https://sollink-ab-pilot.vercel.app`

**On iPhone/Android:** open in Safari/Chrome → **Add to Home Screen** for full-screen.

---

## 2. Shared data (Supabase)

1. Create a project at [supabase.com](https://supabase.com)  
2. **SQL Editor** → paste and run **`supabase/schema.sql`** (includes archive + reset function)  
3. **Settings → API** → copy **Project URL** and **anon public** key  

### Local dev

Edit `js/config.js`:

```js
window.SOLLINK_CONFIG = {
  supabaseUrl: 'https://xxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbG...',
};
```

### Vercel (recommended for production)

**Project → Settings → Environment Variables**

| Name | Value |
|------|--------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | your anon key |

Redeploy. Build writes `js/config.js` from these env vars.

Without Supabase, each phone only stores data locally — **not suitable for a team pilot**.

---

## 3. Admin dashboard

**URL:** `https://YOUR-DEPLOY-URL/admin.html`

| Action | What it does |
|--------|----------------|
| **Refresh** | Reload live data + archive list |
| **Archive & reset live data** | Saves current sessions to archive, clears live table for a new round |
| **Viewing** dropdown | Switch between **Live data** and past **archives** |
| **Export CSV** | Download current view (live or archive) |

---

## Quick local test

```bash
python3 -m http.server 8080
# http://localhost:8080/?variant=B
# http://localhost:8080/admin.html
```

---

## Tracked metrics

- **CTR** — % of sessions with CTA clicks (overall + per button)  
- **Viewing duration** — total time on page + per-section dwell  
- Variant assignment: 50/50 sticky per session (`?variant=A|B` for QA)

---

## File structure

```
index.html              Prototype
admin.html              A/B comparison dashboard
js/analytics.js         Tracking + archive/reset
js/admin.js             Comparison tables
js/config.js            Supabase keys (or from Vercel env)
supabase/schema.sql     DB + archive_and_reset_sessions()
vercel.json             Deploy config
```
