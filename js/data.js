/* ==========================================================================
   js/data.js — Data layer (localStorage "database")
   --------------------------------------------------------------------------
   In Module 1 we have no back end yet, so we store everything in the
   browser's localStorage. In Module 3+ this file gets replaced by real
   MongoDB/Mongoose models and fetch() calls to an Express API.

   Everything is attached to `window` so it can be used from any page with a
   plain <script> tag (no bundler, no import/export — keeping it simple).
   ========================================================================== */

(function () {
  "use strict";

  var POSTS_KEY = "codomax_blog_posts";
  var USERS_KEY = "codomax_blog_users";
  var SESSION_KEY = "codomax_blog_session";
  var SEEDED_KEY = "codomax_blog_seeded";

  /* -----------------------------------------------------------------------
     SEED DATA — sample posts shown on a fresh install
     ----------------------------------------------------------------------- */
  var seedPosts = [
    {
      id: "p-1001",
      title: "Getting Started with the MERN Stack",
      excerpt:
        "MongoDB, Express, React and Node.js — what each layer does, how they talk to each other, and how to plan your first full stack project.",
      content:
        "The MERN stack is four technologies that cover every layer of a web app.\n\nMongoDB stores your data as JSON-like documents. Express is a thin web framework running on Node.js that exposes REST endpoints. React renders the user interface in the browser. Node.js is the JavaScript runtime that powers the server.\n\nThe big win: one language, JavaScript, everywhere. You write your schema validation, your API routes and your components in the same syntax, and you can share code between the front end and the back end.\n\nIn this internship we build layer by layer. Module 1 is pure HTML, CSS and JavaScript. Later we swap this static UI for React components, then add an Express API, then persist everything in MongoDB.",
      category: "MERN",
      emoji: "🚀",
      cover: "",
      author: "Aarav Sharma",
      authorEmail: "aarav@codomax.in",
      date: "2026-10-18",
      readTime: 5,
      status: "published",
    },
    {
      id: "p-1002",
      title: "CSS Grid vs Flexbox: When to Use Which",
      excerpt:
        "Flexbox lays things out in one direction. Grid lays them out in two. Here is the mental model that finally made it click for me.",
      content:
        "The rule of thumb that cleared up years of confusion for me:\n\nUse Flexbox when you are laying items out in a single row or a single column — a navbar, a button group, a card footer.\n\nUse Grid when you care about both rows and columns at the same time — a page layout, a gallery, a dashboard.\n\nThey also compose beautifully. This project uses Grid for the card gallery and Flexbox inside each card. Neither tool is 'better'; they solve different problems.\n\nA bonus trick from this codebase: grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)) gives you a fully responsive gallery with zero media queries.",
      category: "CSS",
      emoji: "🎨",
      cover: "",
      author: "Priya Nayak",
      authorEmail: "priya@codomax.in",
      date: "2026-10-22",
      readTime: 4,
      status: "published",
    },
    {
      id: "p-1003",
      title: "JavaScript Array Methods You Will Use Daily",
      excerpt:
        "map, filter, reduce, find and some — the five methods that cover about 90% of the data work in a front end app.",
      content:
        "map() transforms every item and returns a new array of the same length. Use it to turn data into HTML, or into a different shape.\n\nfilter() keeps only the items that pass a test. Use it for search boxes and category filters — this blog's search bar is literally one filter() call.\n\nreduce() boils an array down to a single value: a total, a count, a grouped object. The dashboard's 'total words written' stat uses it.\n\nfind() returns the first match — perfect for looking up a post by id.\n\nsome() and every() answer yes/no questions about the array.\n\nThe key idea: none of these mutate the original array. That immutability is exactly what React relies on later in this course.",
      category: "JavaScript",
      emoji: "⚡",
      cover: "",
      author: "Rohit Das",
      authorEmail: "rohit@codomax.in",
      date: "2026-10-27",
      readTime: 6,
      status: "published",
    },
    {
      id: "p-1004",
      title: "Building Forms That People Actually Complete",
      excerpt:
        "Labels, inline validation, sensible defaults and honest error messages — small details that massively lift completion rates.",
      content:
        "Forms are where users either convert or quit. A few rules I now follow every time:\n\n1. Always use a real <label> linked to the input. Placeholders are not labels — they disappear the moment someone types.\n\n2. Validate on blur, not on every keystroke. Telling someone their email is invalid while they are still typing it is hostile.\n\n3. Show the error next to the field, in plain language. 'Enter an email address' beats 'Invalid input'.\n\n4. Use the right type attribute. type='email' and type='password' give you free validation and the correct mobile keyboard.\n\n5. Never clear the form when validation fails. Losing typed input because of one bad field is the fastest way to lose a user.",
      category: "UX",
      emoji: "📝",
      cover: "",
      author: "Sneha Patro",
      authorEmail: "sneha@codomax.in",
      date: "2026-10-30",
      readTime: 4,
      status: "published",
    },
    {
      id: "p-1005",
      title: "Responsive Design Without a Framework",
      excerpt:
        "Fluid grids, clamp() for typography, and three breakpoints. You can ship a genuinely responsive UI with about 40 lines of CSS.",
      content:
        "You do not need a CSS framework to build responsive layouts. Three techniques carry most of the weight.\n\nFirst, fluid grids: repeat(auto-fill, minmax(290px, 1fr)) lets the browser decide how many columns fit. No breakpoints required.\n\nSecond, fluid type: font-size: clamp(2rem, 5vw, 3rem) scales headings smoothly between a minimum and a maximum instead of jumping at breakpoints.\n\nThird, a couple of well chosen media queries for the things that genuinely change shape — like turning the horizontal navbar into a hamburger menu under 860px.\n\nRound it out with box-sizing: border-box, max-width: 100% on images, and a flex-wrap on anything that sits in a row, and your layout survives almost any screen size.",
      category: "CSS",
      emoji: "📱",
      cover: "",
      author: "Aarav Sharma",
      authorEmail: "aarav@codomax.in",
      date: "2026-11-01",
      readTime: 5,
      status: "published",
    },
    {
      id: "p-1006",
      title: "How localStorage Works (and When Not to Use It)",
      excerpt:
        "A 5MB key-value store in every browser. Perfect for prototypes and theme preferences — never for passwords or tokens.",
      content:
        "localStorage is a simple synchronous key-value store that persists across page reloads and browser restarts, scoped to a single origin.\n\nIt only stores strings, so you JSON.stringify() on the way in and JSON.parse() on the way out. Wrap both in try/catch — corrupt or disabled storage should not crash your app.\n\nGood uses: theme preference, draft posts, caching, and (as here) faking a database while you are learning.\n\nBad uses: passwords, auth tokens, or anything sensitive. localStorage is readable by any script on the page, which makes it an XSS target. Real authentication — coming in a later module — belongs in an httpOnly cookie.",
      category: "JavaScript",
      emoji: "💾",
      cover: "",
      author: "Priya Nayak",
      authorEmail: "priya@codomax.in",
      date: "2026-11-03",
      readTime: 4,
      status: "published",
    },
  ];

  /* -----------------------------------------------------------------------
     LOW-LEVEL HELPERS
     ----------------------------------------------------------------------- */

  /** Read JSON from localStorage. Returns `fallback` if missing or corrupt. */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (err) {
      console.warn("[store] Could not read " + key + ":", err);
      return fallback;
    }
  }

  /** Write JSON to localStorage. Returns true on success. */
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("[store] Could not write " + key + ":", err);
      return false;
    }
  }

  /** Generate an id. Good enough for the client; MongoDB will use ObjectIds later. */
  function uid(prefix) {
    return (
      (prefix || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    );
  }

  /* -----------------------------------------------------------------------
     SEEDING — run once, so user changes are never overwritten
     ----------------------------------------------------------------------- */
  function seed() {
    if (localStorage.getItem(SEEDED_KEY)) return;
    write(POSTS_KEY, seedPosts);
    localStorage.setItem(SEEDED_KEY, "1");
  }

  /* -----------------------------------------------------------------------
     POSTS API
     ----------------------------------------------------------------------- */
  var Posts = {
    all: function () {
      return read(POSTS_KEY, []);
    },
    byId: function (id) {
      return this.all().filter(function (p) {
        return p.id === id;
      })[0];
    },
    byAuthor: function (email) {
      return this.all()
        .filter(function (p) {
          return p.authorEmail === email;
        })
        .sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
    },
    create: function (data) {
      var posts = this.all();
      var post = {
        id: uid("p"),
        title: data.title,
        // Fall back to an auto-generated excerpt when the author leaves it blank.
        excerpt: data.excerpt || utils.makeExcerpt(data.content, 150),
        content: data.content,
        category: data.category || "General",
        emoji: data.emoji || "📄",
        cover: data.cover || "",
        author: data.author,
        authorEmail: data.authorEmail,
        date: new Date().toISOString().slice(0, 10),
        readTime: data.readTime || utils.readTime(data.content),
        status: data.status || "published",
      };
      posts.unshift(post); // newest first
      write(POSTS_KEY, posts);
      return post;
    },
    update: function (id, changes) {
      var posts = this.all();
      var updated = null;
      posts = posts.map(function (p) {
        if (p.id !== id) return p;
        updated = Object.assign({}, p, changes, { id: p.id });
        return updated;
      });
      write(POSTS_KEY, posts);
      return updated;
    },
    remove: function (id) {
      write(
        POSTS_KEY,
        this.all().filter(function (p) {
          return p.id !== id;
        })
      );
    },
  };

  /* -----------------------------------------------------------------------
     USERS API (mock auth — replaced by JWT + bcrypt in a later module)
     ----------------------------------------------------------------------- */
  var Users = {
    all: function () {
      return read(USERS_KEY, []);
    },
    findByEmail: function (email) {
      var target = String(email).toLowerCase().trim();
      return this.all().filter(function (u) {
        return u.email === target;
      })[0];
    },
    create: function (data) {
      var users = this.all();
      var user = {
        id: uid("u"),
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        // ⚠️ NEVER store plain passwords in a real app. Module 4+ replaces
        // this with bcrypt hashing on the server.
        password: data.password,
        joined: new Date().toISOString().slice(0, 10),
      };
      users.push(user);
      write(USERS_KEY, users);
      return user;
    },
  };

  /* -----------------------------------------------------------------------
     SESSION (who is logged in right now)
     ----------------------------------------------------------------------- */
  var Session = {
    get: function () {
      return read(SESSION_KEY, null);
    },
    set: function (user) {
      write(SESSION_KEY, { id: user.id, name: user.name, email: user.email });
    },
    clear: function () {
      localStorage.removeItem(SESSION_KEY);
    },
  };

  /* -----------------------------------------------------------------------
     SMALL UTILITIES SHARED BY EVERY PAGE
     ----------------------------------------------------------------------- */
  var utils = {
    /** "2026-11-03" -> "3 Nov 2026" */
    formatDate: function (iso) {
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
    /** "Aarav Sharma" -> "AS" */
    initials: function (name) {
      return String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (w) {
          return w[0];
        })
        .join("")
        .toUpperCase();
    },
    /** Rough reading time in minutes for a block of text. */
    readTime: function (text) {
      return Math.max(1, Math.round(String(text).trim().split(/\s+/).length / 200));
    },
    /** Turn a long body into a short excerpt. */
    makeExcerpt: function (text, max) {
      max = max || 150;
      var clean = String(text).replace(/\s+/g, " ").trim();
      if (clean.length <= max) return clean;
      return clean.slice(0, clean.lastIndexOf(" ", max)) + "…";
    },
    /** Escape HTML so user input can never inject markup (basic XSS defence). */
    escape: function (str) {
      return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
      });
    },
  };

  // Boot: make sure the sample content exists.
  seed();

  // Expose everything globally.
  window.Store = { Posts: Posts, Users: Users, Session: Session, utils: utils };
  window.seedPosts = seedPosts;
})();
