/* ==========================================================================
   js/home.js — Home page (index.html)
   --------------------------------------------------------------------------
   Renders the blog feed, the category chips, the search box and the hero
   counters. Everything comes from window.Store (localStorage).
   ========================================================================== */

(function () {
  "use strict";

  var Posts = window.Store.Posts;
  var utils = window.Store.utils;

  // State of the page: what the user typed and which category is selected.
  var state = { query: "", category: "All" };

  /* -----------------------------------------------------------------------
     CARD TEMPLATE
     Note utils.escape() — user content is always escaped before it is
     injected as HTML, so a post titled <script> can never execute.
     ----------------------------------------------------------------------- */
  function cardHTML(post) {
    var cover = post.cover
      ? '<img src="' + utils.escape(post.cover) + '" alt="">'
      : utils.escape(post.emoji || "📄");

    return (
      '<article class="card">' +
      '<div class="card-cover">' + cover + "</div>" +
      '<div class="card-body">' +
      '<span class="badge">' + utils.escape(post.category) + "</span>" +
      '<h3 class="card-title">' + utils.escape(post.title) + "</h3>" +
      '<p class="card-excerpt">' + utils.escape(post.excerpt) + "</p>" +
      '<div class="card-meta">📅 ' + utils.escape(utils.formatDate(post.date)) +
      " · ⏱ " + post.readTime + " min read</div>" +
      "</div>" +
      '<div class="card-footer">' +
      '<div class="author"><span class="avatar">' +
      utils.escape(utils.initials(post.author)) +
      "</span>" + utils.escape(post.author) + "</div>" +
      '<a class="btn btn-sm btn-outline" href="post.html?id=' +
      encodeURIComponent(post.id) + '">Read →</a>' +
      "</div>" +
      "</article>"
    );
  }

  /* -----------------------------------------------------------------------
     FILTERING — search + category, both applied together
     ----------------------------------------------------------------------- */
  function visiblePosts() {
    var q = state.query.toLowerCase().trim();

    return Posts.all()
      .filter(function (p) {
        if (p.status === "draft") return false; // drafts are private
        if (state.category !== "All" && p.category !== state.category) return false;
        if (!q) return true;
        return (
          p.title.toLowerCase().indexOf(q) > -1 ||
          p.excerpt.toLowerCase().indexOf(q) > -1 ||
          p.author.toLowerCase().indexOf(q) > -1 ||
          p.category.toLowerCase().indexOf(q) > -1
        );
      })
      .sort(function (a, b) {
        return new Date(b.date) - new Date(a.date); // newest first
      });
  }

  function renderPosts() {
    var grid = document.getElementById("postGrid");
    var count = document.getElementById("resultCount");
    if (!grid) return;

    var list = visiblePosts();

    if (!list.length) {
      grid.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1">' +
        '<span class="emoji">🔍</span>' +
        "<h3>No posts found</h3>" +
        '<p class="muted">Try a different keyword or category.</p>' +
        "</div>";
    } else {
      grid.innerHTML = list.map(cardHTML).join("");
    }

    if (count) {
      count.textContent =
        list.length + (list.length === 1 ? " post" : " posts") + " found";
    }
  }

  /* -----------------------------------------------------------------------
     CATEGORY CHIPS — built from the data, so new categories appear auto
     ----------------------------------------------------------------------- */
  function renderChips() {
    var host = document.getElementById("chips");
    if (!host) return;

    var cats = ["All"];
    Posts.all().forEach(function (p) {
      if (p.status === "draft") return;
      if (cats.indexOf(p.category) === -1) cats.push(p.category);
    });

    host.innerHTML = cats
      .map(function (c) {
        return (
          '<button class="chip' +
          (c === state.category ? " active" : "") +
          '" data-cat="' + utils.escape(c) + '">' + utils.escape(c) + "</button>"
        );
      })
      .join("");

    host.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.category = chip.dataset.cat;
        renderChips();
        renderPosts();
      });
    });
  }

  /* -----------------------------------------------------------------------
     HERO STATS
     ----------------------------------------------------------------------- */
  function renderStats() {
    var posts = Posts.all().filter(function (p) {
      return p.status !== "draft";
    });

    var authors = posts.reduce(function (acc, p) {
      if (acc.indexOf(p.authorEmail) === -1) acc.push(p.authorEmail);
      return acc;
    }, []);

    var cats = posts.reduce(function (acc, p) {
      if (acc.indexOf(p.category) === -1) acc.push(p.category);
      return acc;
    }, []);

    var set = function (id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("statPosts", posts.length);
    set("statAuthors", authors.length);
    set("statCategories", cats.length);
  }

  /* -----------------------------------------------------------------------
     EVENTS
     ----------------------------------------------------------------------- */
  function initEvents() {
    var search = document.getElementById("searchInput");
    if (!search) return;

    // Debounce: wait 200ms after the last keystroke before filtering.
    var timer;
    search.addEventListener("input", function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.query = e.target.value;
        renderPosts();
      }, 200);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderStats();
    renderChips();
    renderPosts();
    initEvents();
  });
})();
