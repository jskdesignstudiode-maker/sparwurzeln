/* KI-Entwurf: ruft den Worker auf und legt das Ergebnis als Entwurf (Status "entwurf") im Repository ab.
   Die Anmeldung wird vom Verwaltungsbereich (/admin/) übernommen. */
(function () {
  var form = document.getElementById('form');
  var statusBox = document.getElementById('status');
  var resultBox = document.getElementById('result');
  var goBtn = document.getElementById('go');
  var catSelect = document.getElementById('category');

  function getToken() {
    try {
      var u = JSON.parse(localStorage.getItem('decap-cms-user') || 'null');
      return u && u.token ? u.token : null;
    } catch (e) {
      return null;
    }
  }
  function show(el, cls, html) {
    el.className = 'msg ' + cls;
    el.innerHTML = html;
    el.hidden = false;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function toBase64(text) {
    var bytes = new TextEncoder().encode(text);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  if (!getToken()) {
    show(statusBox, 'info', 'Bitte melden Sie sich zuerst unter <a href="/admin/">/admin/</a> an und öffnen Sie diese Seite danach erneut.');
    goBtn.disabled = true;
  }

  fetch('/admin/kategorien.json')
    .then(function (r) { return r.json(); })
    .then(function (cats) {
      catSelect.innerHTML = cats.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.title) + '</option>'; }).join('');
    })
    .catch(function () { show(statusBox, 'err', 'Kategorien konnten nicht geladen werden.'); });

  async function githubFile(repo, path, token, options) {
    return fetch('https://api.github.com/repos/' + repo + '/contents/' + path, Object.assign({
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
    }, options));
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var token = getToken();
    if (!token) return;
    goBtn.disabled = true;
    goBtn.textContent = 'Entwurf wird erstellt … (kann eine Minute dauern)';
    resultBox.hidden = true;
    try {
      var res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          topic: document.getElementById('topic').value,
          category: catSelect.value,
          notes: document.getElementById('notes').value,
        }),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        show(resultBox, 'err', esc(data.message || 'Es ist ein Fehler aufgetreten.'));
        return;
      }

      // Freien Dateinamen finden, nichts überschreiben
      var slug = data.slug;
      var n = 1;
      while (true) {
        var check = await githubFile(data.repo, 'src/content/artikel/' + slug + '.md', token);
        if (check.status === 404) break;
        n += 1;
        slug = data.slug + '-' + n;
        if (n > 20) throw new Error('Kein freier Dateiname gefunden.');
      }
      var put = await githubFile(data.repo, 'src/content/artikel/' + slug + '.md', token, {
        method: 'PUT',
        body: JSON.stringify({
          message: 'KI-Entwurf „' + slug + '“ angelegt',
          content: toBase64(data.markdown),
          branch: 'main',
        }),
      });
      if (!put.ok) throw new Error('Speichern im Repository fehlgeschlagen (Status ' + put.status + ').');

      show(
        resultBox,
        'ok',
        '<strong>Entwurf gespeichert:</strong> ' + esc(data.title) +
          '<br>Status: Entwurf (nicht sichtbar). <a href="/admin/#/collections/artikel/entries/' + encodeURIComponent(slug) + '">Jetzt im Verwaltungsbereich öffnen und prüfen →</a>' +
          '<br><span class="small">Bitte alle [PRÜFEN]-Stellen und die internen Prüfhinweise abarbeiten, Quellen ergänzen und den Prüftermin eintragen. Erst danach auf „Freigegeben“ stellen.</span>'
      );
      form.reset();
    } catch (err) {
      show(resultBox, 'err', esc(err.message || String(err)));
    } finally {
      goBtn.disabled = false;
      goBtn.textContent = 'Entwurf erstellen';
    }
  });
})();
