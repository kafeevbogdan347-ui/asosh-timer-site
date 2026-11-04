// Кнопки скачивания: подставляем ссылки из LINKS или показываем «скоро»
document.querySelectorAll('[data-link]').forEach((el) => {
  const url = (window.LINKS || {})[el.dataset.link];
  if (url) {
    el.href = url;
    if (el.dataset.link === 'apk') el.setAttribute('download', '');
  } else if (el.dataset.soon) {
    el.textContent = el.dataset.soon;
    el.classList.add('is-soon');
    el.setAttribute('aria-disabled', 'true');
  }
});

// Детали iPhone поверх скриншотов: Dynamic Island, строка состояния и полоска «домой»
const STATUS_ICONS =
  '<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>' +
  '<svg viewBox="0 0 16 12" aria-hidden="true"><path fill="currentColor" d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.3-1.3A10.8 10.8 0 0 0 8 .3 10.8 10.8 0 0 0 .4 3.4l1.3 1.3A9 9 0 0 1 8 2.2zm0 3.7c1.4 0 2.7.5 3.7 1.4L13 6a7.3 7.3 0 0 0-10 0l1.3 1.3c1-.9 2.3-1.4 3.7-1.4zm0 3.6c-.6 0-1.2.2-1.6.6L8 11.7l1.6-1.6c-.4-.4-1-.6-1.6-.6z"/></svg>' +
  '<svg viewBox="0 0 27 12" aria-hidden="true"><rect x=".5" y=".5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><path d="M25 4v4c.8-.3 1.3-1.1 1.3-2S25.8 4.3 25 4z" fill="currentColor" opacity=".5"/></svg>';
document.querySelectorAll('.iphone').forEach((el) => {
  el.insertAdjacentHTML(
    'beforeend',
    `<i class="island" aria-hidden="true"></i><div class="sb" aria-hidden="true"><span>10:05</span><span class="sb-icons">${STATUS_ICONS}</span></div><i class="home-bar" aria-hidden="true"></i>`
  );
});

// Плавное появление блоков при прокрутке
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Живой таймер звонков (1 смена) по времени Аргаяша
const BELLS = [
  ['08:00', '08:40'],
  ['08:50', '09:30'],
  ['09:40', '10:20'],
  ['10:35', '11:15'],
  ['11:30', '12:10'],
  ['12:20', '13:00'],
];
const SUBJECTS = ['Алгебра', 'Русский язык', 'Физика', 'История', 'Английский', 'Физкультура'];
// Четверти как в приложении: между ними — каникулы
const QUARTERS = [
  ['2026-09-01', '2026-10-30'],
  ['2026-11-09', '2026-12-30'],
  ['2027-01-11', '2027-03-20'],
  ['2027-03-29', '2027-05-28'],
];

const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function argayashNow() {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    weekday: get('weekday'),
    date: `${get('year')}-${get('month')}-${get('day')}`,
    sec: Number(get('hour')) * 3600 + Number(get('minute')) * 60 + Number(get('second')),
  };
}

const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const dayWord = (n) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'дня';
  return 'дней';
};
const daysBetween = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);

const els = {
  clock: document.getElementById('demo-clock'),
  label: document.getElementById('demo-label'),
  timer: document.getElementById('demo-timer'),
  fill: document.getElementById('demo-fill'),
  sub: document.getElementById('demo-sub'),
  lessons: document.getElementById('demo-lessons'),
};

let lastNow = null;
function renderLessons(activeIndex, sec) {
  if (activeIndex === lastNow) return;
  lastNow = activeIndex;
  els.lessons.innerHTML = BELLS.map(([start, end], i) => {
    const done = sec >= toMin(end) * 60;
    const cls = i === activeIndex ? 'now' : done ? 'done' : '';
    return `<li class="${cls}"><b>${i + 1}. ${SUBJECTS[i]}</b><span>${start}–${end}</span></li>`;
  }).join('');
}

function show(label, timer, fill, sub, word = false) {
  els.label.textContent = label;
  els.timer.textContent = timer;
  // Слова шире цифр — для них шрифт поменьше, чтобы не вылезали из телефона
  els.timer.classList.toggle('timer-word', word);
  els.fill.style.width = `${fill}%`;
  els.sub.textContent = sub;
}

function tick() {
  const { weekday, date, sec } = argayashNow();
  els.clock.textContent = fmt(Math.floor(sec / 60));

  const inQuarter = QUARTERS.some(([s, e]) => date >= s && date <= e);
  if (!inQuarter) {
    const next = QUARTERS.find(([s]) => s > date);
    const left = next ? daysBetween(date, next[0]) : 0;
    show('Сейчас', 'Каникулы', 0, next ? `До учёбы ${left} ${dayWord(left)} — отдыхай` : 'Лето! Отдыхай', true);
    renderLessons('off', 0);
    return;
  }
  // Пятидневка: суббота и воскресенье — выходные
  if (weekday === 'сб' || weekday === 'вс') {
    show('Сегодня', 'Выходной', 0, 'Уроков нет — отдыхай', true);
    renderLessons('off', 0);
    return;
  }

  const first = toMin(BELLS[0][0]) * 60;
  const last = toMin(BELLS[BELLS.length - 1][1]) * 60;

  if (sec < first) {
    // Ночью таймер на 7 часов вперёд выглядит странно — показываем время начала
    if (first - sec > 3600) show('Уроки начнутся', BELLS[0][0], 0, 'Выспись как следует');
    else show('До первого урока', fmt(first - sec), 0, `Начало в ${BELLS[0][0]}`);
    renderLessons(-1, sec);
    return;
  }
  if (sec >= last) {
    show('Уроки закончились', '✓', 100, 'Не забудь про домашку');
    renderLessons(-3, sec);
    return;
  }

  for (let i = 0; i < BELLS.length; i++) {
    const start = toMin(BELLS[i][0]) * 60;
    const end = toMin(BELLS[i][1]) * 60;
    if (sec >= start && sec < end) {
      show('До звонка с урока', fmt(end - sec), ((sec - start) / (end - start)) * 100, `Идёт ${i + 1} урок · ${SUBJECTS[i]}`);
      renderLessons(i, sec);
      return;
    }
    const next = BELLS[i + 1] && toMin(BELLS[i + 1][0]) * 60;
    if (next && sec >= end && sec < next) {
      show('Перемена', fmt(next - sec), ((sec - end) / (next - end)) * 100, `Дальше ${i + 2} урок · ${SUBJECTS[i + 1]}`);
      renderLessons(-4 - i, sec);
      return;
    }
  }
}

tick();
setInterval(tick, 1000);
