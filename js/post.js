/* ==========================================================================
   js/post.js — Single post view (post.html)
   --------------------------------------------------------------------------
   Reads ?id=... from the URL, renders that post, and lists related
   articles from the same category.
   ========================================================================== */

(function () {
  "use strict";

  var Posts = window.Store.Posts;
  var utils = window.Store.utils;

  function renderRelated(current) {
    var host = document.getElementById("relatedPosts");
    if (!host) return;

    var related = Posts.all()
      .filter(function (p) {
        return p.id !== current.id && p.category === current.category && p.status !== "draft";
      })
      .slice(0, 3);

    if (!related.length) {
      host.innerHTML =
        '<p class="muted">No other posts in ' + utils.escape(current.category) + " yet.</p>";
      return;
    }

    host.innerHTML = related
      .map(function (p) {
        return (
          '<a class="post-row" href="post.html?id=' + encodeURIComponent(p.id) + '">' +
          '<div class="cover-thumb">' + utils.escape(p.emoji || "📄") + "</div>" +
          '<div class="row-main">' +
          '<div class="row-title">' + utils.escape(p.title) + "</div>" +
          '<div class="row-meta">' + utils.escape(utils.formatDate(p.date)) +
          " · " + p.readTime + " min read</div>" +
          "</div></a>"
        );
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    var post = id ? Posts.byId(id) : null;

    var host = document.getElementById("postArticle");

    if (!post) {
      if (host) {
        host.innerHTML =
          '<div class="empty-state"><span class="emoji">🤔</span>' +
          "<h3>Post not found</h3>" +
          '<p class="muted">The post you are looking for may have been deleted.</p>' +
          '<a class="btn mt-2" href="index.html">Back to home</a></div>';
      }
      return;
    }

    // Page title in the browser tab
    document.title = post.title + " — Codomax Blog";

    if (host) {
      var cover = post.cover
        ? '<img src="' + utils.escape(post.cover) + '" alt="">'
        : utils.escape(post.emoji || "📄");

      host.innerHTML =
        '<div class="preview-cover" style="height:220px;font-size:4rem">' + cover + "</div>" +
        '<span class="badge">' + utils.escape(post.category) + "</span>" +
        '<h1 style="margin:14px 0 10px">' + utils.escape(post.title) + "</h1>" +
        '<div class="card-meta" style="margin-bottom:22px">' +
        '<span class="avatar">' + utils.escape(utils.initials(post.author)) + "</span>" +
        "<strong>" + utils.escape(post.author) + "</strong> · " +
        utils.escape(utils.formatDate(post.date)) + " · " + post.readTime + " min read</div>" +
        '<p class="preview-body" style="max-height:none;color:var(--text);font-size:1.02rem">' +
        utils.escape(post.content) + "</p>";
    }

    renderRelated(post);
  });
})();
