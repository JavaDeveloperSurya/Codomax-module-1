/* ==========================================================================
   js/create-blog.js — Create / Edit post page (create-blog.html)
   --------------------------------------------------------------------------
   - Live preview as you type
   - Auto-generated excerpt and read time
   - Save as published or draft
   - Edit mode when the URL contains ?id=POST_ID
   ========================================================================== */

(function () {
  "use strict";

  var Posts = window.Store.Posts;
  var utils = window.Store.utils;

  var user = null;
  var editingId = null; // null = create mode, otherwise we are editing

  /* -----------------------------------------------------------------------
     ELEMENT SHORTCUTS
     ----------------------------------------------------------------------- */
  var el = {};

  function cacheElements() {
    el.form = document.getElementById("blogForm");
    el.title = document.getElementById("postTitle");
    el.category = document.getElementById("postCategory");
    el.emoji = document.getElementById("postEmoji");
    el.cover = document.getElementById("postCover");
    el.excerpt = document.getElementById("postExcerpt");
    el.content = document.getElementById("postContent");
    el.status = document.getElementById("postStatus");

    el.previewTitle = document.getElementById("previewTitle");
    el.previewCover = document.getElementById("previewCover");
    el.previewBadge = document.getElementById("previewBadge");
    el.previewMeta = document.getElementById("previewMeta");
    el.previewBody = document.getElementById("previewBody");
    el.wordCount = document.getElementById("wordCount");
    el.formTitle = document.getElementById("formTitle");
    el.submitBtn = document.getElementById("submitBtn");
  }

  /* -----------------------------------------------------------------------
     LIVE PREVIEW
     Runs on every keystroke — cheap enough because it only touches text.
     ----------------------------------------------------------------------- */
  function updatePreview() {
    var title = el.title.value.trim();
    var content = el.content.value;
    var words = content.trim() ? content.trim().split(/\s+/).length : 0;

    el.previewTitle.textContent = title || "Your post title will appear here";
    el.previewCover.innerHTML = el.cover.value.trim()
      ? '<img src="' + utils.escape(el.cover.value.trim()) + '" alt="">'
      : utils.escape(el.emoji.value || "📄");
    el.previewBadge.textContent = el.category.value || "General";
    el.previewMeta.textContent =
      (el.category.value || "General") + " · " + utils.readTime(content) + " min read";
    el.previewBody.textContent = content || "Start writing and your post will preview here…";
    el.wordCount.textContent = words + (words === 1 ? " word" : " words");
  }

  /* -----------------------------------------------------------------------
     VALIDATION
     ----------------------------------------------------------------------- */
  function setFieldError(input, message) {
    var errorEl = input.parentElement.querySelector(".field-error");
    if (!errorEl) return;
    input.classList.toggle("invalid", !!message);
    errorEl.textContent = message || "";
  }

  function validate() {
    var ok = true;

    if (!el.title.value.trim()) {
      setFieldError(el.title, "Give your post a title.");
      ok = false;
    } else if (el.title.value.trim().length < 5) {
      setFieldError(el.title, "Titles should be at least 5 characters.");
      ok = false;
    } else {
      setFieldError(el.title, "");
    }

    if (el.content.value.trim().length < 30) {
      setFieldError(el.content, "Write at least 30 characters of content.");
      ok = false;
    } else {
      setFieldError(el.content, "");
    }

    return ok;
  }

  /* -----------------------------------------------------------------------
     EDIT MODE — fill the form when ?id=... is present
     ----------------------------------------------------------------------- */
  function loadForEdit() {
    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    if (!id) return;

    var post = Posts.byId(id);
    if (!post) {
      App.toast("That post no longer exists.", "error");
      return;
    }
    if (post.authorEmail !== user.email) {
      App.toast("You can only edit your own posts.", "error");
      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 1200);
      return;
    }

    editingId = id;
    el.title.value = post.title;
    el.category.value = post.category;
    el.emoji.value = post.emoji || "📄";
    el.cover.value = post.cover || "";
    el.excerpt.value = post.excerpt || "";
    el.content.value = post.content || "";
    el.status.value = post.status || "published";

    if (el.formTitle) el.formTitle.textContent = "Edit post";
    if (el.submitBtn) el.submitBtn.textContent = "Update post";
  }

  /* -----------------------------------------------------------------------
     SUBMIT
     ----------------------------------------------------------------------- */
  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      App.toast("Please fix the highlighted fields.", "error");
      return;
    }

    var content = el.content.value.trim();
    var payload = {
      title: el.title.value.trim(),
      category: el.category.value,
      emoji: el.emoji.value || "📄",
      cover: el.cover.value.trim(),
      // If the author left the excerpt empty, derive one from the body.
      excerpt: el.excerpt.value.trim() || utils.makeExcerpt(content, 150),
      content: content,
      readTime: utils.readTime(content),
      status: el.status.value,
      author: user.name,
      authorEmail: user.email,
    };

    if (editingId) {
      Posts.update(editingId, payload);
      App.toast("Post updated ✅", "success");
    } else {
      Posts.create(payload);
      App.toast("Post published 🎉", "success");
    }

    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 800);
  }

  /* -----------------------------------------------------------------------
     OPTIONAL: keep a draft if the user leaves the page mid-write
     ----------------------------------------------------------------------- */
  var DRAFT_KEY = "codomax_blog_draft";

  function initAutoDraft() {
    if (editingId) return; // only for brand new posts

    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    } catch (e) {}

    if (saved && window.confirm("You have an unsaved draft. Restore it?")) {
      el.title.value = saved.title || "";
      el.category.value = saved.category || "General";
      el.emoji.value = saved.emoji || "📄";
      el.cover.value = saved.cover || "";
      el.excerpt.value = saved.excerpt || "";
      el.content.value = saved.content || "";
      updatePreview();
    }

    document.getElementById("saveDraftBtn").addEventListener("click", function () {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title: el.title.value,
            category: el.category.value,
            emoji: el.emoji.value,
            cover: el.cover.value,
            excerpt: el.excerpt.value,
            content: el.content.value,
          })
        );
        App.toast("Draft saved locally.", "info");
      } catch (e) {
        App.toast("Could not save the draft.", "error");
      }
    });

    // Clear the stored draft once the post is actually published.
    el.form.addEventListener("submit", function () {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
    });
  }

  /* -----------------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    user = App.requireAuth();
    if (!user) return;

    cacheElements();
    if (!el.form) return;

    loadForEdit();
    updatePreview();

    ["input", "change"].forEach(function (evt) {
      el.form.addEventListener(evt, updatePreview);
    });
    el.form.addEventListener("submit", handleSubmit);

    // Warn before losing work if the user closes the tab.
    window.addEventListener("beforeunload", function (e) {
      if (el.title.value.trim() || el.content.value.trim().length > 30) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    initAutoDraft();
  });
})();
