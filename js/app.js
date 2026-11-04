/* ==========================================================================
   js/app.js — Shared behaviour for EVERY page
   --------------------------------------------------------------------------
   Include this file on every page, right before the page-specific script.
   It handles: theme (dark/light), mobile menu, toasts, the auth-aware
   navbar, footer year, active link highlighting, route guarding and logout.
   ========================================================================== */

(function () {
  "use strict";

  var utils = window.Store.utils;

  /* -----------------------------------------------------------------------
     1. THEME — remembers the choice in localStorage
     ----------------------------------------------------------------------- */
  var THEME_KEY = "codomax_theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (e) {
      /* storage disabled — fall back to light */
    }
    applyTheme(saved || "light");

    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
        applyTheme(next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
      });
    }
  }

  /* -----------------------------------------------------------------------
     2. MOBILE MENU
     ----------------------------------------------------------------------- */
  function initNavToggle() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      // Accessibility: tell screen readers whether the menu is expanded.
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu after tapping any link (better UX on phones).
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* -----------------------------------------------------------------------
     3. TOASTS — small pop-up messages
     Usage: App.toast("Saved!", "success")
     ----------------------------------------------------------------------- */
  function getToastContainer() {
    var box = document.querySelector(".toast-container");
    if (!box) {
      box = document.createElement("div");
      box.className = "toast-container";
      document.body.appendChild(box);
    }
    return box;
  }

  function toast(message, type, duration) {
    var el = document.createElement("div");
    el.className = "toast " + (type || "info");
    el.setAttribute("role", "status");
    el.textContent = message;
    getToastContainer().appendChild(el);

    setTimeout(function () {
      el.classList.add("hide");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, duration || 3000);
  }

  /* -----------------------------------------------------------------------
     4. AUTH — show the right navbar buttons for the current user
     ----------------------------------------------------------------------- */
  function currentUser() {
    return window.Store.Session.get();
  }

  /**
   * Render the right-hand side of the navbar.
   * Logged out -> [Sign in] [Get started]
   * Logged in  -> [Write] [avatar + name] [Logout]
   */
  function renderNavActions() {
    var host = document.getElementById("navAuth");
    if (!host) return;

    var user = currentUser();
    host.innerHTML = "";

    if (!user) {
      host.insertAdjacentHTML(
        "beforeend",
        '<a class="btn btn-outline btn-sm" href="login.html">Sign in</a>' +
          '<a class="btn btn-sm" href="register.html">Get started</a>'
      );
      return;
    }

    var initial = utils.escape(utils.initials(user.name));
    host.insertAdjacentHTML(
      "beforeend",
      '<a class="btn btn-outline btn-sm" href="create-blog.html">✏️ Write</a>' +
        '<div class="author" title="' + utils.escape(user.email) + '">' +
        '<span class="avatar">' + initial + "</span>" +
        "<span>" + utils.escape(user.name.split(" ")[0]) + "</span></div>" +
        '<button class="icon-btn" id="logoutBtn" title="Log out">↩</button>'
    );

    var out = document.getElementById("logoutBtn");
    if (out) {
      out.addEventListener("click", function () {
        window.Store.Session.clear();
        toast("Logged out. See you soon!", "info");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 700);
      });
    }
  }

  /**
   * Protect a page: redirect to login.html if nobody is signed in.
   * Call App.requireAuth() from dashboard.html / create-blog.html.
   */
  function requireAuth() {
    var user = currentUser();
    if (!user) {
      toast("Please sign in to continue.", "error");
      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
      return null;
    }
    return user;
  }

  /* -----------------------------------------------------------------------
     5. MISC — active nav link + footer year
     ----------------------------------------------------------------------- */
  function initMisc() {
    // Highlight the link matching the current file name.
    var file = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === file) a.classList.add("active");
    });

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNavToggle();
    initMisc();
    renderNavActions();
  });

  // Public API used by the other scripts.
  window.App = {
    toast: toast,
    currentUser: currentUser,
    requireAuth: requireAuth,
    renderNavActions: renderNavActions,
  };
})();
