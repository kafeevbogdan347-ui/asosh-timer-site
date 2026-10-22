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

const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function argayashNow() {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    weekday: get('weekday'),
    sec: Number(get('hour')) * 3600 + Number(get('minute')) * 60 + Number(get('second')),
  };
}

const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

const els = {
  clock: document.getElementById('demo-clock'),
  label: document.getElementById('demo-label'),
  timer: document.getElementById('demo-timer'),
  fill: document.getElementById('demo-fill'),
  sub: document.getElementById('demo-sub'),
  lessons: document.getElementById('demo-lessons'),
};

let lastNow = -1;
function renderLessons(activeIndex, sec) {
  if (activeIndex === lastNow) return;
  lastNow = activeIndex;
  els.lessons.innerHTML = BELLS.map(([start, end], i) => {
    const done = sec >= toMin(end) * 60;
    const cls = i === activeIndex ? 'now' : done ? 'done' : '';
    return `<li class="${cls}"><b>${i + 1}. ${SUBJECTS[i]}</b><span>${start}–${end}</span></li>`;
  }).join('');
}

function tick() {
  const { weekday, sec } = argayashNow();
  els.clock.textContent = fmt(Math.floor(sec / 60));

  if (weekday === 'вс') {
    els.label.textContent = 'Сегодня';
    els.timer.textContent = 'Выходной';
    els.fill.style.width = '0%';
    els.sub.textContent = 'Уроков нет — отдыхай';
    renderLessons(-2, 0);
    return;
  }

  const first = toMin(BELLS[0][0]) * 60;
  const last = toMin(BELLS[BELLS.length - 1][1]) * 60;

  if (sec < first) {
    els.label.textContent = 'До первого урока';
    els.timer.textContent = fmt(Math.min(first - sec, 5999));
    els.fill.style.width = '0%';
    els.sub.textContent = `Начало в ${BELLS[0][0]}`;
    renderLessons(-1, sec);
    return;
  }
  if (sec >= last) {
    els.label.textContent = 'Уроки закончились';
    els.timer.textContent = '✓';
    els.fill.style.width = '100%';
    els.sub.textContent = 'Не забудь про домашку';
    renderLessons(-3, sec);
    return;
  }

  for (let i = 0; i < BELLS.length; i++) {
    const start = toMin(BELLS[i][0]) * 60;
    const end = toMin(BELLS[i][1]) * 60;
    if (sec >= start && sec < end) {
      els.label.textContent = 'До звонка с урока';
      els.timer.textContent = fmt(end - sec);
      els.fill.style.width = `${((sec - start) / (end - start)) * 100}%`;
      els.sub.textContent = `Идёт ${i + 1} урок · ${SUBJECTS[i]}`;
      renderLessons(i, sec);
      return;
    }
    const next = BELLS[i + 1] && toMin(BELLS[i + 1][0]) * 60;
    if (next && sec >= end && sec < next) {
      els.label.textContent = 'Перемена';
      els.timer.textContent = fmt(next - sec);
      els.fill.style.width = `${((sec - end) / (next - end)) * 100}%`;
      els.sub.textContent = `Дальше ${i + 2} урок · ${SUBJECTS[i + 1]}`;
      renderLessons(-4 - i, sec);
      return;
    }
  }
}

tick();
setInterval(tick, 1000);
