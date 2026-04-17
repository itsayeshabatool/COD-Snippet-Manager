(function () {
  var STORAGE_KEY = "cod-snippet-manager:v1";

  var DEFAULT_SNIPPETS = [
    {
      id: "1",
      title: "Fetch JSON",
      tag: "javascript",
      code: "const res = await fetch(url);\nconst data = await res.json();",
    },
    {
      id: "2",
      title: "useEffect cleanup",
      tag: "react",
      code:
        "useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);",
    },
    {
      id: "3",
      title: "Flex center",
      tag: "css",
      code: ".wrap {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}",
    },
  ];

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : null;
    } catch (e) {
      return null;
    }
  }

  function persist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  var snippets = loadStored();
  if (!snippets || !snippets.length) {
    snippets = DEFAULT_SNIPPETS.slice();
    persist(snippets);
  }

  function snippetById(id) {
    for (var i = 0; i < snippets.length; i++) {
      if (snippets[i].id === id) return snippets[i];
    }
    return null;
  }

  function copyFallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
  }

  function matchesQuery(s, q) {
    if (!q) return true;
    return (
      s.title.toLowerCase().indexOf(q) !== -1 ||
      s.tag.indexOf(q) !== -1 ||
      s.code.toLowerCase().indexOf(q) !== -1
    );
  }

  function esc(t) {
    var d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }

  function copySnippet(btn, text) {
    function done(ok) {
      btn.textContent = ok ? "Copied!" : "Select & copy";
      setTimeout(function () {
        btn.textContent = "Copy";
      }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          done(true);
        },
        function () {
          done(copyFallback(text));
        }
      );
    } else {
      done(copyFallback(text));
    }
  }

  function init() {
    var listEl = document.getElementById("list");
    var form = document.getElementById("form");
    var search = document.getElementById("search");
    if (!listEl || !form || !search) return;

    function render() {
      var q = search.value.trim().toLowerCase();
      var filtered = [];
      for (var f = 0; f < snippets.length; f++) {
        if (matchesQuery(snippets[f], q)) filtered.push(snippets[f]);
      }

      var html = "";
      for (var j = 0; j < filtered.length; j++) {
        var s = filtered[j];
        html +=
          '<li class="item">' +
          '<div class="item-head">' +
          "<strong>" +
          esc(s.title) +
          "</strong>" +
          '<span class="badge">' +
          esc(s.tag) +
          "</span>" +
          '<button type="button" class="copy" data-id="' +
          esc(String(s.id)) +
          '">Copy</button>' +
          "</div>" +
          "<pre>" +
          esc(s.code) +
          "</pre>" +
          "</li>";
      }
      listEl.innerHTML = html;

      var buttons = listEl.querySelectorAll(".copy");
      for (var b = 0; b < buttons.length; b++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            var id = btn.getAttribute("data-id");
            var sn = snippetById(id);
            if (sn) copySnippet(btn, sn.code);
          });
        })(buttons[b]);
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var titleEl = document.getElementById("title");
      var tagEl = document.getElementById("tag");
      var codeEl = document.getElementById("code");
      if (!titleEl || !tagEl || !codeEl) return;
      var title = titleEl.value.trim();
      var tag = tagEl.value;
      var code = codeEl.value.trim();
      if (!title || !code) return;
      snippets.unshift({
        id: String(Date.now()),
        title: title,
        tag: tag,
        code: code,
      });
      persist(snippets);
      form.reset();
      render();
    });

    search.addEventListener("input", render);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
