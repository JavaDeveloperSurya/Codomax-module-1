/* ==========================================================================
   js/auth.js — Login (login.html) and Register (register.html)
   --------------------------------------------------------------------------
   Mock authentication backed by localStorage.
   In a later module this becomes a real POST /api/auth/login against
   Express + MongoDB with bcrypt password hashing and a JWT cookie.
   ========================================================================== */

(function () {
  "use strict";

  var Users = window.Store.Users;
  var Session = window.Store.Session;

  /* -----------------------------------------------------------------------
     VALIDATION HELPERS
     Each returns an error message string, or "" when the value is fine.
     ----------------------------------------------------------------------- */
  var validators = {
    required: function (value, label) {
      return String(value).trim() ? "" : label + " is required.";
    },
    email: function (value) {
      // Deliberately simple — good enough for a form, never for a server.
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())
        ? ""
        : "Enter a valid email address.";
    },
    minLength: function (value, n, label) {
      return String(value).length >= n
        ? ""
        : label + " must be at least " + n + " characters.";
    },
    match: function (a, b) {
      return a === b ? "" : "Passwords do not match.";
    },
  };

  /** Show/hide the small red message under a field. */
  function setFieldError(input, message) {
    var errorEl = input.parentElement.querySelector(".field-error");
    if (!errorEl) return;
    if (message) {
      input.classList.add("invalid");
      errorEl.textContent = message;
    } else {
      input.classList.remove("invalid");
      errorEl.textContent = "";
    }
  }

  /** Validate one field and paint the result. Returns true when valid. */
  function checkField(input, message) {
    setFieldError(input, message);
    return !message;
  }

  /* -----------------------------------------------------------------------
     PASSWORD STRENGTH (register page only)
     ----------------------------------------------------------------------- */
  function scorePassword(pw) {
    var score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  function initStrength() {
    var pw = document.getElementById("regPassword");
    var bar = document.getElementById("strengthBar");
    var label = document.getElementById("strengthLabel");
    if (!pw || !bar) return;

    var levels = [
      { w: "25%", bg: "#e11d48", text: "Weak" },
      { w: "50%", bg: "#f59e0b", text: "Fair" },
      { w: "75%", bg: "#06b6d4", text: "Good" },
      { w: "100%", bg: "#10b981", text: "Strong" },
    ];

    pw.addEventListener("input", function () {
      var val = pw.value;
      if (!val) {
        bar.style.width = "0";
        if (label) label.textContent = "";
        return;
      }
      var lvl = levels[Math.max(0, scorePassword(val) - 1)];
      bar.style.width = lvl.w;
      bar.style.background = lvl.bg;
      if (label) {
        label.textContent = lvl.text;
        label.style.color = lvl.bg;
      }
    });
  }

  /* -----------------------------------------------------------------------
     REGISTER
     ----------------------------------------------------------------------- */
  function initRegister() {
    var form = document.getElementById("registerForm");
    if (!form) return;

    var name = document.getElementById("regName");
    var email = document.getElementById("regEmail");
    var pw = document.getElementById("regPassword");
    var confirm = document.getElementById("regConfirm");
    var terms = document.getElementById("regTerms");

    // Validate on blur so we do not nag the user mid-typing.
    name.addEventListener("blur", function () {
      checkField(name, validators.required(name.value, "Full name"));
    });
    email.addEventListener("blur", function () {
      checkField(
        email,
        validators.required(email.value, "Email") || validators.email(email.value)
      );
    });
    pw.addEventListener("blur", function () {
      checkField(pw, validators.minLength(pw.value, 6, "Password"));
    });
    confirm.addEventListener("blur", function () {
      checkField(confirm, validators.match(pw.value, confirm.value));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // never reload the page on submit

      var ok = true;
      ok = checkField(name, validators.required(name.value, "Full name")) && ok;
      ok =
        checkField(
          email,
          validators.required(email.value, "Email") || validators.email(email.value)
        ) && ok;
      ok = checkField(pw, validators.minLength(pw.value, 6, "Password")) && ok;
      ok = checkField(confirm, validators.match(pw.value, confirm.value)) && ok;

      if (!terms.checked) {
        App.toast("Please accept the terms to continue.", "error");
        ok = false;
      }
      if (!ok) return;

      if (Users.findByEmail(email.value)) {
        checkField(email, "That email is already registered.");
        App.toast("Account already exists — try signing in.", "error");
        return;
      }

      var user = Users.create({
        name: name.value,
        email: email.value,
        password: pw.value,
      });

      Session.set(user);
      App.toast("Welcome, " + user.name.split(" ")[0] + "! 🎉", "success");
      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 800);
    });

    initStrength();
  }

  /* -----------------------------------------------------------------------
     LOGIN
     ----------------------------------------------------------------------- */
  function initLogin() {
    var form = document.getElementById("loginForm");
    if (!form) return;

    var email = document.getElementById("loginEmail");
    var pw = document.getElementById("loginPassword");
    var btn = document.getElementById("loginBtn");

    email.addEventListener("blur", function () {
      checkField(email, validators.email(email.value));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!checkField(email, validators.email(email.value))) return;
      if (!checkField(pw, validators.required(pw.value, "Password"))) return;

      var user = Users.findByEmail(email.value);

      // One generic message for both failure cases — never reveal which
      // email addresses exist (a small but real privacy win).
      if (!user || user.password !== pw.value) {
        pw.classList.add("invalid");
        App.toast("Incorrect email or password.", "error");
        return;
      }
      pw.classList.remove("invalid");

      // Fake a network round-trip so the loading state is visible.
      btn.disabled = true;
      btn.textContent = "Signing in…";

      setTimeout(function () {
        Session.set(user);
        App.toast("Signed in as " + user.name.split(" ")[0], "success");
        window.location.href = "dashboard.html";
      }, 700);
    });
  }

  /* -----------------------------------------------------------------------
     DEMO ACCOUNT — one click sign in for quick testing
     ----------------------------------------------------------------------- */
  function initDemo() {
    var btn = document.getElementById("demoLogin");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var email = "demo@codomax.in";
      var user = Users.findByEmail(email);

      if (!user) {
        user = Users.create({ name: "Demo User", email: email, password: "demo123" });
      }
      Session.set(user);
      App.toast("Signed in as Demo User", "success");
      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 600);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRegister();
    initLogin();
    initDemo();
  });
})();
