/* Subject selection and podcast links for the 2.º ESO catalogue. */
(() => {
  const subjects = [...document.querySelectorAll('details.subject[id]')];
  const picker = document.getElementById('subject-picker');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let active = null;

  document.querySelectorAll('details.remember[id]').forEach(item => {
    const saved = read('audiogela:' + item.id);
    if (saved !== null) item.open = saved === 'open';
    item.addEventListener('toggle', () => save('audiogela:' + item.id, item.open ? 'open' : 'closed'));
  });

  function selectSubject(subject, { updateUrl = false, scroll = false } = {}) {
    active = subject;
    subjects.forEach(item => {
      item.open = item === subject;
      save('audiogela:' + item.id, item.open ? 'open' : 'closed');
    });
    picker.querySelectorAll('a[href]').forEach(link => {
      const selected = subject !== null && link.hash === '#' + subject.id;
      link.classList.toggle('primary', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    save('audiogela:active-subject', subject ? subject.id : '');
    if (updateUrl) {
      const hash = subject ? '#' + subject.id : '';
      if (location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
    }
    if (scroll && subject) subject.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function subjectFromHash() {
    const target = document.getElementById(location.hash.slice(1));
    return target?.closest('details.subject') || null;
  }

  function openHashTarget() {
    const subject = subjectFromHash();
    if (!subject) return false;
    selectSubject(subject);
    // Links back from an existing lesson also expand its language/unit/episode.
    let target = document.getElementById(location.hash.slice(1));
    while (target && target !== subject) {
      if (target.matches('details')) target.open = true;
      target = target.parentElement;
    }
    return true;
  }

  subjects.forEach(subject => {
    subject.querySelector(':scope > summary').addEventListener('click', event => {
      event.preventDefault();
      selectSubject(subject.open ? null : subject, { updateUrl: true });
    });
    subject.addEventListener('toggle', () => {
      if (subject.open && active !== subject) selectSubject(subject, { updateUrl: true });
      else if (!subject.open && active === subject) selectSubject(null, { updateUrl: true });
    });
  });

  picker.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', event => {
    const subject = subjects.find(item => '#' + item.id === link.hash);
    if (!subject) return;
    event.preventDefault();
    selectSubject(subject, { updateUrl: true, scroll: true });
  }));

  window.addEventListener('hashchange', () => {
    if (!openHashTarget()) selectSubject(null);
  });
  if (!openHashTarget()) {
    const saved = read('audiogela:active-subject');
    selectSubject(saved === '' ? null : subjects.find(item => item.id === saved) || subjects.find(item => item.open) || null);
  }

  document.querySelectorAll('audio').forEach(player => player.addEventListener('play', () => {
    document.querySelectorAll('audio').forEach(other => { if (other !== player) other.pause(); });
  }));

  document.querySelectorAll('[data-copy-target]').forEach(button => {
    const label = button.textContent;
    let timer;
    button.addEventListener('click', async () => {
      const input = document.getElementById(button.dataset.copyTarget);
      const status = document.getElementById('copy-status');
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(input.value);
        button.textContent = 'Copiada';
        status.textContent = 'URL de ' + button.dataset.subject + ' copiada.';
      } catch {
        input.focus();
        input.select();
        button.textContent = 'Selecciona y copia';
        status.textContent = 'Selecciona y copia la URL de ' + button.dataset.subject + '.';
      }
      timer = setTimeout(() => { button.textContent = label; }, 2000);
    });
  });
})();
