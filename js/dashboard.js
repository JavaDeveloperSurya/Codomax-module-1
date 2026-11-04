/* ==========================================================================
   js/dashboard.html — js/dashboard.js
   --------------------------------------------------------------------------
   The author's control panel: stats + a list of their own posts with
   edit and delete actions. Requires a signed-in user.
   ========================================================================== */

(function () {
  "use strict";

  var Posts = window.Store.Posts;
  var utils = window.Store.utils;

  var user = null; // set on DOMContentLoaded

  /* -----------------------------------------------------------------------
     STATS
     ----------------------------------------------------------------------- */
  function renderStats(list) {
    var published = list.filter(function (p) {
      return p.status !== "draft";
    }).length;
    var drafts = list.length - published;

    var words = list.reduce(function (total, p) {
      return total + String(p.content).trim().split(/\s+/).length;
    }, 0);

    var set = function (id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("statTotal", list.length);
    set("statPublished", published);
    set("statDrafts", drafts);
    set("statWords", words.toLocaleString("en-IN"));
  }

  /* -----------------------------------------------------------------------
     POST ROWS
     ----------------------------------------------------------------------- */
  function rowHTML(post) {
    var cover = post.cover
      ? '<img src="' + utils.escape(post.cover) + '" alt="">'
      : utils.escape(post.emoji || "📄");

    var isDraft = post.status === "draft";

    return (
      '<div class="post-row" data-id="' + utils.escape(post.id) + '">' +
      '<div class="cover-thumb">' + cover + "</div>" +
      '<div class="row-main">' +
      '<div class="row-title">' + utils.escape(post.title) +
      (isDraft ? ' <span class="badge" style="margin-left:6px">Draft</span>' : "") +
      "</div>" +
      '<div class="row-meta">' + utils.escape(post.category) + " · " +
      utils.escape(utils.formatDate(post.date)) + " · " + post.readTime + " min read</div>" +
      "</div>" +
      '<div class="row-actions">' +
      '<a class="btn btn-sm btn-outline" href="post.html?id=' + encodeURIComponent(post.id) + '">View</a>' +
      '<a class="btn btn-sm btn-outline" href="create-blog.html?id=' + encodeURIComponent(post.id) + '">Edit</a>' +
      '<button class="btn btn-sm btn-danger" data-delete="' + utils.escape(post.id) + '">Delete</button>' +
      "</div>" +
      "</div>"
    );
  }

  function renderPosts() {
    var host = document.getElementById("postList");
    if (!host) return;

    var list = Posts.byAuthor(user.email);

    if (!list.length) {
      host.innerHTML =
        '<div class="empty-state">' +
        '<span class="emoji">✍️</span>' +
        "<h3>No posts yet</h3>" +
        '<p class="muted">Your first blog post is a few clicks away.</p>' +
        '<a class="btn mt-2" href="create-blog.html">Create your first post</a>' +
        "</div>";
    } else {
      host.innerHTML = list.map(rowHTML).join("");
    }

    renderStats(list);
  }

  /* -----------------------------------------------------------------------
     DELETE — event delegation: one listener for the whole list
     ----------------------------------------------------------------------- */
  // Attached ONCE at startup. Because the listener lives on the container,
  // it keeps working for rows rendered later — this is "event delegation".
  function bindDelete() {
    var host = document.getElementById("postList");
    host.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-delete]");
      if (!btn) return;

      var id = btn.getAttribute("data-delete");
      var post = Posts.byId(id);
      if (!post) return;

      if (!window.confirm('Delete "' + post.title + '"? This cannot be undone.')) return;

      Posts.remove(id);
      App.toast("Post deleted.", "success");
      renderPosts();
    });
  }

  /* -----------------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    user = App.requireAuth(); // redirects to login.html if signed out
    if (!user) return;

    var greet = document.getElementById("greeting");
    if (greet) greet.textContent = "Welcome back, " + user.name.split(" ")[0] + " 👋";

    bindDelete();
    renderPosts();
  });
})();
