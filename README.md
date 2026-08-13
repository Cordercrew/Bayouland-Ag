# Bayouland Ag Enterprises — website

A three-page static site, ready for GitHub Pages.

```
index.html      → Bayouland Ag Enterprises (the hub: story + farm-to-table + gateways)
honey.html      → Bayou Bees (honey shop + order form)
dairy.html      → Bayouland Creamery (dairy shop + order form)
styles.css      → shared design system
site.js         → nav, scroll effects, order cart + form handling
assets/         → optimized logos + photos
.nojekyll       → tells GitHub Pages to serve files as-is
```

No build step, no framework. Edit the HTML/CSS directly and re-upload.

---

## 1. Put it on GitHub Pages

**Easiest (web upload):**
1. Create a new repository on GitHub (e.g. `bayouland-site`), Public.
2. On the repo page: **Add file → Upload files**, drag in everything from this folder
   (including the `assets` folder), and commit.
3. **Settings → Pages →** under *Build and deployment*, set **Source = Deploy from a
   branch**, **Branch = main / (root)**, Save.
4. Wait ~1 minute. Your site is live at
   `https://YOUR-USERNAME.github.io/bayouland-site/`.

**Or with git:**
```bash
git init && git add . && git commit -m "Launch site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bayouland-site.git
git push -u origin main
# then enable Pages in Settings as above
```

---

## 2. Your two domains

This is the one thing GitHub Pages can't do out of the box: **one repository can only
carry one custom domain** (it lives in a single `CNAME` file). You have two domains, so
pick one of these:

### Option A — one site, one primary domain + forwarding (recommended)
Keep this single site and point **one** domain at it. Send the **other** domain to the
matching page with a free "domain forward" at your registrar.

- Primary domain, e.g. **bayoubees.com** → the whole site
  (`/` hub, `/honey.html`, `/dairy.html`).
- Second domain, e.g. **bayoulandcreamery.com** → set a **redirect/forward** at the
  registrar to `https://bayoubees.com/dairy.html`.

To attach the primary domain: **Settings → Pages → Custom domain**, type your domain,
Save (GitHub writes the `CNAME` file for you and offers "Enforce HTTPS"). Then at your
registrar add DNS records:

```
# Apex (bayoubees.com) — four A records to GitHub:
A     @   185.199.108.153
A     @   185.199.109.153
A     @   185.199.110.153
A     @   185.199.111.153
# and the www subdomain:
CNAME www YOUR-USERNAME.github.io
```
(Confirm those IPs against GitHub's current "Managing a custom domain" docs before you
save — GitHub occasionally updates them.)

### Option B — two separate sites
If you'd rather each brand have its own true domain and its own home page, make **two
repos** — one with `honey.html` renamed to `index.html` (domain: bayoubees.com) and one
with `dairy.html` renamed to `index.html` (domain: bayoulandcreamery.com), each linking
back to the shared hub. More upkeep (edits happen in two places), so Option A is usually
the better fit for a family operation.

Either way the site works today on the default `github.io` URL — domains are just the
front door.

---

## 3. Turn on the order form (5 minutes)

Right now the **Send order request** button falls back to opening the customer's email
app with the order pre-filled — so nothing is broken before setup. To have orders emailed
to you automatically:

1. Go to **formspree.io**, sign up (free tier is fine), and create a form. You'll get an
   endpoint like `https://formspree.io/f/abcmyzwv`.
2. In **both** `honey.html` and `dairy.html`, find this line and paste your endpoint in
   place of the placeholder:
   ```html
   data-endpoint="https://formspree.io/f/YOUR_FORM_ID"
   ```
3. While you're there, set the fallback address on the same `<form>` tag
   (`data-fallback-email="orders@bayoubees.com"`) to a real inbox.

That's it — order requests now land in your email, with the customer's name, contact,
pickup/delivery choice, item list, and notes. (Getform and Basin work the same way if you
prefer them.)

### Taking payment later
These forms send an order **request**, not a charge — you confirm price and collect
payment your way. When you want real checkout, the low-effort paths are **Square Online**,
**Shopify** buy buttons, or **Stripe Payment Links** — each gives you a link or snippet
you can drop onto the product cards.

---

## 4. Everyday edits

- **Prices:** search each shop page for `price on request` (and the `<span class="ph">`
  bits) and replace with your real numbers, e.g. `<p class="price">$14</p>`.
- **Products:** the cards live in the `#shop` section of `honey.html` / `dairy.html`.
  Copy a `<article class="prod">…</article>` block to add one. Give each new quantity
  picker a unique `data-product="..."` and a `data-name="..."` — that's what shows up in
  the order summary.
- **Dairy photos:** the dairy product cards currently reuse farm photos as placeholders.
  Drop real shots of your milk/butter/cheese into `assets/` and update the `<img src>`.
- **Words:** all copy is plain text in the HTML — the family story is in `index.html`
  under `#story`; edit freely.
- **Colors/fonts:** every color is a variable at the top of `styles.css`
  (`--honey`, `--creamery`, `--bayou`, …). Change them in one place.

## Notes
- `Banner_1.psd` and `jar_3.psd` weren't used — browsers can't read Photoshop files. If
  you want either on the site, export a PNG/JPG from Photoshop and add it to `assets/`.
- **Raw milk:** dairy sales are regulated state by state. Make sure your product list and
  any labeling follow current Louisiana rules before you publish the dairy page.
