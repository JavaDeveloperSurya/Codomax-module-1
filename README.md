# Module 1 — Frontend Development: Responsive Blog Application

**Program:** MERN Full Stack Web Development Internship — Codomax Digital
**Module:** 1 of 7 — Frontend Development
**Stack for this module:** Plain HTML5, CSS3, vanilla JavaScript (no frameworks, no build tools)

---

## ✅ Module 1 objectives and where each one is covered

| # | Objective | How it's satisfied |
|---|-----------|--------------------|
| 1 | Set up your local development environment | Section "Local environment setup" below |
| 2 | Learn basics of HTML, CSS, JavaScript | Every file is heavily commented; see "What the code teaches you" |
| 3 | Design a responsive Blog Application interface | `css/styles.css` + all 6 pages; works from 320px to 4K |
| 4 | Create pages: Home, Login, Register, Dashboard, Create Blog | `index.html`, `login.html`, `register.html`, `dashboard.html`, `create-blog.html` (+ bonus `post.html`) |

---

## 📁 Project structure

```
codomax-module1/
├── index.html           # Home — hero, search, category chips, post grid
├── login.html           # Login form + demo-account sign in
├── register.html        # Registration form + password strength meter
├── dashboard.html       # Author dashboard — stats, edit/delete own posts
├── create-blog.html     # Create / edit post with live preview
├── post.html            # (bonus) Single post view + related posts
├── css/
│   └── styles.css       # One stylesheet for the whole app (12 numbered sections)
└── js/
    ├── data.js          # Data layer: localStorage "database" + 6 seed posts
    ├── app.js           # Shared: theme toggle, mobile menu, toasts, auth, logout
    ├── home.js          # Home page logic (render, search, filter)
    ├── auth.js          # Login + register validation and submission
    ├── dashboard.js     # Dashboard stats, post list, delete
    ├── create-blog.js   # Editor: live preview, word count, save/edit
    └── post.js          # Single post view + related posts
```

**Load order matters** — every page ends with:
```html
<script src="js/data.js"></script>   <!-- 1. data layer          -->
<script src="js/app.js"></script>    <!-- 2. shared behaviour    -->
<script src="js/home.js"></script>   <!-- 3. page-specific logic -->
```

---

## 🛠️ Local environment setup (Objective 1)

### 1. Install the tooling

| Tool | Why | Download |
|------|-----|----------|
| **VS Code** | Code editor | https://code.visualstudio.com/ |
| **Node.js & npm** (LTS) | Needed from Module 3 onward | https://nodejs.org/ |
| **Git** | Version control, submissions | https://git-scm.com/ |
| **Live Server** (VS Code extension) | Auto-reloads the browser on save | Extensions panel → search "Live Server" (Ritwick Dey) |

Verify the installs from a terminal:
```bash
node --version     # v20.x or newer
npm --version      # 10.x or newer
git --version
```

### 2. Get the code onto your machine

```bash
# Option A — clone your own fork/repo
git clone <your-repo-url>
cd codomax-module1

# Option B — just unzip the folder the internship shared with you
```

### 3. Run it

**Easiest (recommended):** open `index.html` in VS Code → right-click → **"Open with Live Server"**.
It serves on `http://127.0.0.1:5500` and reloads on every save.

**Anywhere, no extensions needed** (Python is pre-installed on macOS/Linux):
```bash
cd codomax-module1
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node:
```bash
npx serve .
```

> ⚠️ **Do not just double-click `index.html`.** Opening via `file://` breaks some
> browser features (and localStorage can behave inconsistently between files).
> Always serve over `http://localhost`.

### 4. VS Code extensions worth having

- **Live Server** – instant reload
- **Prettier** – consistent formatting (`Shift+Alt+F`)
- **ESLint** – catches JS mistakes as you type
- **Color Highlight** – shows hex colours inline in CSS

---

## 🚀 How to use the app

1. Open **Home** — 6 seeded articles render automatically.
2. Search by keyword or click a **category chip** to filter.
3. Click **Register** → create an account (or use **"Continue with demo account"** on the Login page).
4. You land on the **Dashboard** — it's empty at first.
5. Click **New post** → write in **Create Blog** and watch the live preview panel update as you type.
6. Save as **Published** or **Draft**. Drafts stay private to you.
7. From the Dashboard you can **View**, **Edit**, or **Delete** your posts.

> Everything is stored in `localStorage`, so it's per-browser and per-device.
> To reset to the original demo content, run this in the browser console:
> ```js
> localStorage.clear(); location.reload();
> ```

---

## 🧠 What the code teaches you (Objective 2)

### HTML
- Semantic elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- Forms: `<label for>` ↔ `id` pairing, `type="email" / "password" / "url"`, `autocomplete`, `novalidate`
- Accessibility: `aria-label`, `aria-expanded`, `role="status"`, `alt` text
- The `viewport` meta tag — without it, nothing is responsive on mobile

### CSS
- **Design tokens** — `:root` variables + a `[data-theme="dark"]` override (see §1 of `styles.css`)
- **Flexbox** for one-dimensional layout (navbar, card footer, stat rows)
- **CSS Grid** for two-dimensional layout: `repeat(auto-fill, minmax(290px, 1fr))` gives a responsive gallery with **zero media queries**
- **Fluid typography**: `clamp(2rem, 5vw, 3rem)`
- **Position**: `sticky` navbar, `fixed` toasts
- **Transitions/hover states**, `prefers-reduced-motion` support
- **Mobile-first-ish breakpoints** at 900px / 860px / 620px — the navbar collapses into a hamburger under 860px
- Truncation with `-webkit-line-clamp` and `text-overflow: ellipsis`

### JavaScript
- **IIFEs** (`(function(){ ... })()`) to avoid polluting the global scope
- **DOM selection & events**: `addEventListener`, `DOMContentLoaded`, `event.preventDefault()`
- **Event delegation** — one listener on the post list handles every Delete button
- **Array methods in anger**: `map`, `filter`, `reduce`, `sort` (home search, dashboard stats)
- **Template literals** to build HTML strings
- **localStorage** with `JSON.stringify` / `JSON.parse` and `try/catch`
- **Debouncing** — the search box waits 200 ms after your last keystroke
- **XSS safety** — `utils.escape()` sanitises every piece of user content before it becomes HTML
- **Mock auth** — session in localStorage, protected routes via `App.requireAuth()`

---

## 🗺️ Roadmap for the remaining modules

| Module | What changes in this project |
|--------|------------------------------|
| 2 | Convert pages into **React components**; React Router replaces page links |
| 3 | Add **Node.js + Express** REST API (`GET/POST/PUT/DELETE /api/posts`) |
| 4 | Connect **MongoDB + Mongoose**; `js/data.js` is deleted and replaced by fetch calls |
| 5 | Real **authentication** — bcrypt hashing, JWT, protected routes |
| 6 | File uploads (Cloudinary/S3) for cover images, rich-text editor |
| 7 | Deployment (Vercel + Render/Railway), testing, final submission |

---

## 📝 Submission checklist for Module 1

- [ ] Project runs locally via Live Server with no console errors
- [ ] All 6 pages render and link to each other
- [ ] Layout checked at 375px (mobile), 768px (tablet) and 1440px (desktop)
- [ ] Dark mode toggle works and persists on reload
- [ ] Register → Login → Create post → see it on Home → edit/delete from Dashboard
- [ ] Code pushed to Git with meaningful commit messages
