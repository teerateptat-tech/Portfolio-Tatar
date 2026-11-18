document.documentElement.classList.add('js');

/* ==========================================================================
   1. Intro loader (Boot sequence)
   ========================================================================== */
(() => {
  const boot = document.getElementById('boot');
  if (!boot) return;
  const number = boot.querySelector('.boot-num');
  const bar = boot.querySelector('.boot-bar i');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    boot.remove();
    return;
  }
  const start = performance.now();
  function load(now) {
    const value = Math.min(100, Math.round((now - start) / 11));
    number.textContent = String(value).padStart(2, '0');
    bar.style.width = value + '%';
    if (value < 100) {
      requestAnimationFrame(load);
    } else {
      setTimeout(() => {
        boot.classList.add('done');
        setTimeout(() => boot.remove(), 850);
      }, 180);
    }
  }
  requestAnimationFrame(load);
})();

/* ==========================================================================
   2. Live time in navigation
   ========================================================================== */
const clock = document.getElementById('clock');
function updateClock() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 30000);

/* ==========================================================================
   3. Cursor and gentle visual parallax on mousemove
   ========================================================================== */
const cursor = document.querySelector('.cursor-dot');
const heroVisual = document.querySelector('.hero-visual');
if (matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove', (event) => {
    if (cursor) {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
    }
    if (heroVisual && !matchMedia('(prefers-reduced-motion: reduce)').matches && window.scrollY < 200) {
      const x = (event.clientX / innerWidth - 0.5) * 12;
      const y = (event.clientY / innerHeight - 0.5) * 12;
      heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    }
  });
  document.querySelectorAll('a, .work-card, .skill-card, button').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor?.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor?.classList.remove('is-hover'));
  });
}

/* ==========================================================================
   4. Hero Falling / Gravity Scroll Transition
   - เมื่อเลื่อนลง องค์ประกอบของหน้าแรกจะค่อยๆ ตกลงมาแบบมีน้ำหนัก/ฟิสิกส์
   ========================================================================== */
(() => {
  const hero = document.getElementById('home');
  if (!hero) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const eyebrow = hero.querySelector('.eyebrow');
  const title = hero.querySelector('#hero-name');
  const roman = hero.querySelector('.hero-roman');
  const desc = hero.querySelector('.hero-description');
  const energyNote = hero.querySelector('.hero-energy-note');
  const actions = hero.querySelector('.hero-actions');
  const sideType = hero.querySelector('.hero-side-type');
  const meta = hero.querySelector('.hero-meta');
  const energySystem = hero.querySelector('.energy-system');

  const portrait = hero.querySelector('.portrait-frame');
  const stamp = hero.querySelector('.signal-stamp');
  const yantra = hero.querySelector('.yantra-wrap');
  const vIndex = hero.querySelector('.visual-index');

  // Parallax elements in other sections
  const aboutHorse = document.querySelector('.about-art .horse');
  const aboutYantra = document.querySelector('.about-art .about-yantra');
  const contactYantra = document.querySelector('.contact-yantra');
  const skillsBackword = document.querySelector('.skills-backword');
  const heroMotionElements = [
    eyebrow, title, roman, desc, energyNote, actions, sideType, meta,
    energySystem, portrait, stamp, yantra, vIndex,
  ].filter(Boolean);
  const compactLayout = matchMedia('(max-width: 900px)');

  let ticking = false;
  let heroTransitionActive = false;

  function onScroll() {
    if (compactLayout.matches) {
      // Keep the stacked hero static so its portrait stays visible while scrolling.
      if (heroTransitionActive) {
        heroMotionElements.forEach((element) => {
          element.style.removeProperty('opacity');
          element.style.removeProperty('transform');
        });
        heroTransitionActive = false;
      }
    } else {
      heroTransitionActive = true;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const heroHeight = hero.offsetHeight || window.innerHeight;

      // --- Hero Falling Transition ---
      if (scrollY <= heroHeight * 1.35) {
        const progress = scrollY / heroHeight;
        const progressSq = progress * progress; // Quadratic acceleration for gravity feel

        if (eyebrow) {
          eyebrow.style.transform = `translate3d(0, ${scrollY * 0.42 + progressSq * 45}px, 0)`;
          eyebrow.style.opacity = Math.max(0, 1 - progress * 1.1);
        }
        if (title) {
          title.style.transform = `translate3d(0, ${scrollY * 0.52 + progressSq * 60}px, 0) rotate(${progress * 2}deg)`;
          title.style.opacity = Math.max(0, 1 - progress * 1.15);
        }
        if (roman) {
          roman.style.transform = `translate3d(0, ${scrollY * 0.65 + progressSq * 75}px, 0)`;
          roman.style.opacity = Math.max(0, 1 - progress * 1.2);
        }
        if (desc) {
          desc.style.transform = `translate3d(0, ${scrollY * 0.76 + progressSq * 88}px, 0)`;
          desc.style.opacity = Math.max(0, 1 - progress * 1.25);
        }
        if (energyNote) {
          energyNote.style.transform = `translate3d(0, ${scrollY * 0.86 + progressSq * 98}px, 0) rotate(${progress * -1.2}deg)`;
          energyNote.style.opacity = Math.max(0, 1 - progress * 1.28);
        }
        if (actions) {
          actions.style.transform = `translate3d(0, ${scrollY * 0.98 + progressSq * 115}px, 0) rotate(${progress * -2.5}deg)`;
          actions.style.opacity = Math.max(0, 1 - progress * 1.32);
        }

        if (energySystem) {
          energySystem.style.transform = `translate3d(0, ${scrollY * 0.52 + progressSq * 60}px, 0)`;
          energySystem.style.opacity = Math.max(0, 1 - progress * 1.2);
        }

        if (portrait) {
          portrait.style.transform = `translate3d(0, ${scrollY * 0.6 + progressSq * 70}px, 0) rotate(${progress * 3.5}deg)`;
          portrait.style.opacity = Math.max(0, 1 - progress * 1.15);
        }
        if (stamp) {
          stamp.style.transform = `rotate(calc(-13deg + ${progress * 32}deg)) translate3d(0, ${scrollY * 1.05 + progressSq * 125}px, 0)`;
          stamp.style.opacity = Math.max(0, 1 - progress * 1.2);
        }
        if (yantra) {
          yantra.style.transform = `translate3d(0, ${scrollY * 0.38}px, 0)`;
        }
        if (vIndex) {
          vIndex.style.transform = `translate3d(0, ${scrollY * 0.45}px, 0) rotate(${progress * -4}deg)`;
        }
        if (sideType) {
          sideType.style.transform = `translate3d(0, ${scrollY * 0.85 + progressSq * 85}px, 0)`;
          sideType.style.opacity = Math.max(0, 1 - progress * 1.2);
        }
        if (meta) {
          meta.style.transform = `translate3d(0, ${scrollY * 0.95}px, 0)`;
          meta.style.opacity = Math.max(0, 1 - progress * 1.3);
        }
      } else {
        // Scrolled past hero: keep opacity 0 for performance
        if (eyebrow) eyebrow.style.opacity = 0;
        if (title) title.style.opacity = 0;
        if (roman) roman.style.opacity = 0;
        if (desc) desc.style.opacity = 0;
        if (energyNote) energyNote.style.opacity = 0;
        if (actions) actions.style.opacity = 0;
        if (portrait) portrait.style.opacity = 0;
        if (stamp) stamp.style.opacity = 0;
        if (sideType) sideType.style.opacity = 0;
        if (meta) meta.style.opacity = 0;
        if (energySystem) energySystem.style.opacity = 0;
      }
    }

    // --- Subtle Inter-section Parallax ---
    if (aboutHorse) {
      const aboutRect = aboutHorse.getBoundingClientRect();
      if (aboutRect.top < window.innerHeight && aboutRect.bottom > 0) {
        const offset = (aboutRect.top / window.innerHeight - 0.5) * 45;
        aboutHorse.style.transform = `translate3d(0, ${offset}px, 0)`;
        if (aboutYantra) {
          aboutYantra.style.transform = `translate3d(0, ${-offset * 0.8}px, 0)`;
        }
      }
    }

    if (skillsBackword) {
      const skillsRect = skillsBackword.getBoundingClientRect();
      if (skillsRect.top < window.innerHeight && skillsRect.bottom > 0) {
        const offset = (skillsRect.top / window.innerHeight) * 35;
        skillsBackword.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
    }

    if (contactYantra) {
      const contactRect = contactYantra.getBoundingClientRect();
      if (contactRect.top < window.innerHeight && contactRect.bottom > 0) {
        const offset = (contactRect.top / window.innerHeight - 0.5) * 50;
        contactYantra.style.marginTop = `${offset}px`;
      }
    }
  }

  const scheduleUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  onScroll();
})();

/* ==========================================================================
   5. Whole-project section transitions
   - ทุกหมวดจะมีจังหวะเข้าแบบ energy flow ไม่ใช่เฉพาะหน้า Hero
   ========================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = [...document.querySelectorAll('main section[id]')];

  sections.forEach((section) => {
    if (section.id !== 'home') {
      section.classList.add('section-motion-ready');
    }
  });

  if (reduce) {
    sections.forEach((section) => section.classList.add('section-motion-in'));
    return;
  }

  const sectionMotionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-motion-in');
        } else if (entry.boundingClientRect.top > 0) {
          // เล่นใหม่ได้เมื่อเลื่อนย้อนกลับขึ้นมา เพื่อให้ทุกหมวดมี transition เสมอ
          entry.target.classList.remove('section-motion-in');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  sections
    .filter((section) => section.id !== 'home')
    .forEach((section) => sectionMotionObserver.observe(section));
})();

/* ==========================================================================
   6. Reveal sections, grow proficiency bars, and mark active nav link
   ========================================================================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');
      if (el.matches('.skill-card')) {
        const level = el.dataset.level || 0;
        el.style.setProperty('--level', level + '%');
      }
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.14 }
);
document.querySelectorAll('.reveal, .skill-card').forEach((el) => revealObserver.observe(el));

const navLinks = [...document.querySelectorAll('.topbar nav a')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id)
      );
    });
  },
  { rootMargin: '-35% 0px -55%', threshold: 0 }
);
document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

/* ==========================================================================
   7. Move to anchor without hiding titles below the sticky navigation
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  });
});

/* ==========================================================================
   8. Vinyl Record Player (Realistic Tonearm, Audio Engine, Crackle & Seek)
   ========================================================================== */
(() => {
  const player = document.querySelector('[data-record-player]');
  if (!player) return;

  const disc = player.querySelector('.record-disc');
  const toggleBtns = player.querySelectorAll('[data-record-toggle]');
  const discIcon = player.querySelector('[data-record-disc-icon]');
  const armLever = player.querySelector('[data-record-arm-lever]');
  const statusEl = player.querySelector('[data-record-status]');
  const progressBar = player.querySelector('[data-record-progress-bar]');
  const progressFill = player.querySelector('[data-record-progress]');
  const progressHandle = player.querySelector('[data-record-handle]');
  const progressTooltip = player.querySelector('[data-record-tooltip]');
  const currentEl = player.querySelector('[data-record-current]');
  const durationEl = player.querySelector('[data-record-duration]');
  const sourceEl = player.querySelector('[data-record-source]');
  const trackNameEl = player.querySelector('[data-record-track-name]');
  const volumeBtn = player.querySelector('[data-record-mute]');
  const volumeIcon = player.querySelector('[data-record-vol-icon]');
  const volumeSlider = player.querySelector('[data-record-volume]');
  const audioEl = player.querySelector('[data-record-audio]');
  const controlBtn = player.querySelector('.record-control');

  // Playback state
  let isPlaying = false;
  let isDropping = false;
  let currentVolume = 0.9;
  let previousVolume = 0.9;
  let trackDuration = 120; // default for synth
  let trackCurrentTime = 0;
  let activeMode = 'detecting'; // 'mp3' or 'synth'
  let synthTimer = null;
  let stoppingTimeout = null;

  // Restore saved volume
  try {
    const savedVol = localStorage.getItem('tatar_record_vol');
    if (savedVol !== null) {
      currentVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      if (volumeSlider) volumeSlider.value = currentVolume;
    }
  } catch (e) {}

  function updateVolumeIcon(vol) {
    if (!volumeIcon) return;
    if (vol <= 0.001) {
      volumeIcon.textContent = '🔇';
    } else if (vol < 0.5) {
      volumeIcon.textContent = '🔉';
    } else {
      volumeIcon.textContent = '🔊';
    }
  }
  updateVolumeIcon(currentVolume);

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  /* --------------------------------------------------------------------------
     Web Audio Engine (Needle drop sound, Vinyl crackle & Cyber Synth Fallback)
     -------------------------------------------------------------------------- */
  let audioCtx = null;
  let masterGain = null;
  let crackleNode = null;
  let crackleGain = null;

  function initAudioContext() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Create Vinyl Crackle Generator
    initVinylCrackle();

    return audioCtx;
  }

  // Realistic needle drop sound: mechanical contact thump + snap
  function playNeedleDropSound() {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub-bass thump
    const osc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.12);

    thumpGain.gain.setValueAtTime(0.35 * currentVolume, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(thumpGain);
    thumpGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.13);

    // Mechanical click / stylus contact
    const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.035), ctx.sampleRate);
    const data = clickBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    }

    const clickSource = ctx.createBufferSource();
    clickSource.buffer = clickBuffer;

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 2400;
    clickFilter.Q.value = 2.0;

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.22 * currentVolume, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(masterGain);

    clickSource.start(now);
  }

  // Looped vinyl crackle & surface noise
  function initVinylCrackle() {
    if (!audioCtx) return;
    const bufferLength = audioCtx.sampleRate * 3; // 3 second loop
    const crackleBuffer = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
    const out = crackleBuffer.getChannelData(0);

    // Pink-noise surface rumble + random Poisson micro-pops
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferLength; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      let val = (b0 + b1 + b2) * 0.03;

      // Random pops (vinyl dust & static)
      if (Math.random() < 0.0007) {
        val += (Math.random() > 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.35);
      }
      out[i] = val;
    }

    crackleGain = audioCtx.createGain();
    crackleGain.gain.setValueAtTime(0, audioCtx.currentTime);
    crackleGain.connect(masterGain);

    crackleNode = audioCtx.createBufferSource();
    crackleNode.buffer = crackleBuffer;
    crackleNode.loop = true;
    crackleNode.connect(crackleGain);
    crackleNode.start();
  }

  function startCrackle() {
    if (crackleGain && audioCtx) {
      crackleGain.gain.cancelScheduledValues(audioCtx.currentTime);
      crackleGain.gain.setValueAtTime(crackleGain.gain.value, audioCtx.currentTime);
      crackleGain.gain.linearRampToValueAtTime(0.075, audioCtx.currentTime + 0.2);
    }
  }

  function stopCrackle() {
    if (crackleGain && audioCtx) {
      crackleGain.gain.cancelScheduledValues(audioCtx.currentTime);
      crackleGain.gain.setValueAtTime(crackleGain.gain.value, audioCtx.currentTime);
      crackleGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
    }
  }

  /* --------------------------------------------------------------------------
     Cyber-Ambient Lo-Fi Synth Music Generator (Intelligent Fallback)
     Plays relaxing Cyberpunk / Natural Circuit chords and bassline
     -------------------------------------------------------------------------- */
  let synthIsRunning = false;
  let synthStep = 0;
  let synthNextNoteTime = 0;
  let synthSchedulerId = null;

  // Em9 - Cmaj7 - Am9 - Bm7
  const CHORDS = [
    { bass: 82.41, notes: [164.81, 196.00, 246.94, 293.66, 369.99] }, // E2 / Em9
    { bass: 65.41, notes: [130.81, 196.00, 246.94, 329.63, 392.00] }, // C2 / Cmaj7
    { bass: 55.00, notes: [110.00, 164.81, 196.00, 261.63, 329.63] }, // A1 / Am9
    { bass: 61.74, notes: [123.47, 185.00, 220.00, 293.66, 369.99] }, // B1 / Bm7
  ];

  const ARPEGGIO_NOTES = [329.63, 392.00, 493.88, 587.33, 659.25, 739.99, 987.77];

  function scheduleSynthStep(stepIndex, time) {
    if (!audioCtx) return;
    const chordIndex = Math.floor(stepIndex / 4) % CHORDS.length;
    const chord = CHORDS[chordIndex];
    const beatInChord = stepIndex % 4;

    // Play chord pad on beat 0
    if (beatInChord === 0) {
      chord.notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, time);
        filter.Q.value = 1.2;

        const padVol = 0.045;
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(padVol, time + 0.35);
        gain.gain.setValueAtTime(padVol, time + 2.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 3.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(time);
        osc.stop(time + 3.5);
      });

      // Sub Bass
      const bassOsc = audioCtx.createOscillator();
      const bassGain = audioCtx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(chord.bass, time);

      bassGain.gain.setValueAtTime(0.001, time);
      bassGain.gain.linearRampToValueAtTime(0.16, time + 0.08);
      bassGain.gain.setValueAtTime(0.14, time + 2.4);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + 3.1);

      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);

      bassOsc.start(time);
      bassOsc.stop(time + 3.2);
    }

    // Melodic Arpeggio Pluck on beats
    const arpFreq = ARPEGGIO_NOTES[(stepIndex * 3 + chordIndex) % ARPEGGIO_NOTES.length];
    const plkOsc = audioCtx.createOscillator();
    const plkGain = audioCtx.createGain();
    const plkFilter = audioCtx.createBiquadFilter();

    plkOsc.type = 'triangle';
    plkOsc.frequency.setValueAtTime(arpFreq, time + 0.02);

    plkFilter.type = 'bandpass';
    plkFilter.frequency.setValueAtTime(arpFreq * 1.5, time);
    plkFilter.Q.value = 2.5;

    plkGain.gain.setValueAtTime(0.001, time);
    plkGain.gain.linearRampToValueAtTime(0.038, time + 0.03);
    plkGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.65);

    plkOsc.connect(plkFilter);
    plkFilter.connect(plkGain);
    plkGain.connect(masterGain);

    plkOsc.start(time);
    plkOsc.stop(time + 0.7);
  }

  function runSynthScheduler() {
    if (!synthIsRunning || !audioCtx) return;
    const lookahead = 0.25;
    const stepDuration = 0.85; // ~70.5 BPM beat interval

    while (synthNextNoteTime < audioCtx.currentTime + lookahead) {
      scheduleSynthStep(synthStep, synthNextNoteTime);
      synthStep++;
      synthNextNoteTime += stepDuration;
    }

    synthSchedulerId = requestAnimationFrame(runSynthScheduler);
  }

  function startSynthPlayback() {
    const ctx = initAudioContext();
    if (!ctx) return;
    synthIsRunning = true;
    synthStep = Math.floor(trackCurrentTime / 0.85);
    synthNextNoteTime = ctx.currentTime + 0.05;
    runSynthScheduler();

    // Time ticker for synth mode
    clearInterval(synthTimer);
    synthTimer = setInterval(() => {
      if (!isPlaying || activeMode !== 'synth') return;
      trackCurrentTime += 0.2;
      if (trackCurrentTime >= trackDuration) {
        trackCurrentTime = 0;
      }
      updateProgressDisplay(trackCurrentTime, trackDuration);
    }, 200);
  }

  function stopSynthPlayback() {
    synthIsRunning = false;
    if (synthSchedulerId) {
      cancelAnimationFrame(synthSchedulerId);
      synthSchedulerId = null;
    }
    clearInterval(synthTimer);
  }

  /* --------------------------------------------------------------------------
     HTML5 Audio Integration (MP3 file: audio/portfolio-track.mp3)
     -------------------------------------------------------------------------- */
  function testAudioSource() {
    if (!audioEl) return;
    audioEl.volume = currentVolume;

    audioEl.addEventListener('loadedmetadata', () => {
      if (!isNaN(audioEl.duration) && audioEl.duration > 1) {
        activeMode = 'mp3';
        trackDuration = audioEl.duration;
        if (durationEl) durationEl.textContent = formatTime(trackDuration);
        if (sourceEl) sourceEl.textContent = 'MP3 FILE / READY';
        if (statusEl && !isPlaying) statusEl.textContent = 'READY / ' + formatTime(trackDuration);
        // คงเครดิตเพลง (พลังสะอาด — Maximus!) จาก index.html ไว้ ไม่เขียนทับด้วยชื่อไฟล์
      }
    });

    audioEl.addEventListener('timeupdate', () => {
      if (activeMode === 'mp3' && isPlaying) {
        trackCurrentTime = audioEl.currentTime;
        updateProgressDisplay(trackCurrentTime, trackDuration);
      }
    });

    audioEl.addEventListener('ended', () => {
      handleTrackEnd();
    });

    audioEl.addEventListener('error', () => {
      // If MP3 file not found (404), seamlessly activate synth mode
      activeMode = 'synth';
      trackDuration = 120;
      if (durationEl) durationEl.textContent = formatTime(trackDuration);
      if (sourceEl) sourceEl.textContent = 'DEMO SYNTH (BUILT-IN)';
      if (trackNameEl) trackNameEl.textContent = 'demo-beat (place mp3 in audio/)';
      if (statusEl && !isPlaying) statusEl.textContent = 'READY / ' + formatTime(trackDuration);
    });

    // Initial check
    if (audioEl.readyState >= 1 && !isNaN(audioEl.duration)) {
      activeMode = 'mp3';
      trackDuration = audioEl.duration;
      if (durationEl) durationEl.textContent = formatTime(trackDuration);
      if (sourceEl) sourceEl.textContent = 'MP3 FILE / READY';
    } else {
      // Default to demo synth display until loaded
      activeMode = 'synth';
      trackDuration = 120;
      if (durationEl) durationEl.textContent = formatTime(trackDuration);
      if (sourceEl) sourceEl.textContent = 'DEMO SYNTH (BUILT-IN)';
    }
  }
  testAudioSource();

  /* --------------------------------------------------------------------------
     UI & Tonearm Controls
     -------------------------------------------------------------------------- */
  function updateProgressDisplay(curr, dur) {
    if (!dur || dur <= 0) return;
    const ratio = Math.max(0, Math.min(1, curr / dur));
    const percent = (ratio * 100).toFixed(2);

    if (progressFill) progressFill.style.width = percent + '%';
    if (progressHandle) progressHandle.style.left = percent + '%';
    if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(percent));
    if (currentEl) currentEl.textContent = formatTime(curr);
    if (statusEl && isPlaying) {
      statusEl.textContent = 'SPINNING / ' + formatTime(curr);
    }

    // Dynamic tonearm tracking: moves across the grooves (23.5deg -> 38deg)
    if (armLever && isPlaying && !isDropping) {
      const armAngle = 23.5 + ratio * 14.5;
      armLever.style.setProperty('--arm-angle', armAngle.toFixed(2) + 'deg');
    }
  }

  function startPlayback() {
    if (isPlaying || isDropping) return;
    isDropping = true;

    initAudioContext();

    // 1. Move tonearm to initial lead-in groove position
    if (armLever) {
      const startAngle = 23.5 + (trackCurrentTime / trackDuration) * 14.5;
      armLever.style.setProperty('--arm-angle', startAngle.toFixed(2) + 'deg');
    }

    if (statusEl) statusEl.textContent = 'DROPPING NEEDLE...';

    // 2. Needle drops after arm arrives (~380ms)
    setTimeout(() => {
      if (armLever) {
        armLever.classList.add('is-needle-dropping');
        setTimeout(() => armLever.classList.remove('is-needle-dropping'), 350);
      }

      // Play needle sound + start vinyl crackle
      playNeedleDropSound();
      startCrackle();

      // Start spinning vinyl
      if (disc) {
        clearTimeout(stoppingTimeout);
        disc.classList.remove('is-stopping');
        disc.classList.add('is-playing');
      }

      // Start audio
      if (activeMode === 'mp3' && audioEl && audioEl.src && !audioEl.error) {
        audioEl.currentTime = trackCurrentTime;
        audioEl.play().catch(() => {
          // Fallback to synth if browser blocks or file fails
          activeMode = 'synth';
          startSynthPlayback();
        });
      } else {
        activeMode = 'synth';
        startSynthPlayback();
      }

      isPlaying = true;
      isDropping = false;

      // Update button & indicators
      if (player) player.classList.add('is-playing');
      if (discIcon) discIcon.textContent = '❚❚';
      if (controlBtn) controlBtn.innerHTML = 'PAUSE TRACK <span>❚❚</span>';
      if (statusEl) statusEl.textContent = 'SPINNING / ' + formatTime(trackCurrentTime);
    }, 380);
  }

  function pausePlayback() {
    if (!isPlaying && !isDropping) return;
    isPlaying = false;
    isDropping = false;

    // 1. Fade crackle & pause music
    stopCrackle();
    if (activeMode === 'mp3' && audioEl) {
      audioEl.pause();
    } else {
      stopSynthPlayback();
    }

    // 2. Return tonearm to rest position (0deg)
    if (armLever) {
      armLever.classList.remove('is-needle-dropping');
      armLever.style.setProperty('--arm-angle', '0deg');
    }

    // 3. Decelerate vinyl disc smoothly
    if (disc) {
      disc.classList.remove('is-playing');
      disc.classList.add('is-stopping');
      stoppingTimeout = setTimeout(() => {
        disc.classList.remove('is-stopping');
      }, 1400);
    }

    // 4. Update UI
    if (player) player.classList.remove('is-playing');
    if (discIcon) discIcon.textContent = '▶';
    if (controlBtn) controlBtn.innerHTML = 'PLAY TRACK <span>↗</span>';
    if (statusEl) statusEl.textContent = 'PAUSED / ' + formatTime(trackCurrentTime);
  }

  function togglePlayback() {
    if (isPlaying || isDropping) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function handleTrackEnd() {
    isPlaying = false;
    isDropping = false;
    trackCurrentTime = 0;
    stopCrackle();

    if (armLever) armLever.style.setProperty('--arm-angle', '0deg');
    if (disc) {
      disc.classList.remove('is-playing');
      disc.classList.add('is-stopping');
      setTimeout(() => disc.classList.remove('is-stopping'), 1400);
    }
    if (player) player.classList.remove('is-playing');
    if (discIcon) discIcon.textContent = '▶';
    if (controlBtn) controlBtn.innerHTML = 'PLAY TRACK <span>↗</span>';
    if (statusEl) statusEl.textContent = 'ENDED / ' + formatTime(trackDuration);
    updateProgressDisplay(0, trackDuration);
  }

  function seekToTime(targetSec) {
    targetSec = Math.max(0, Math.min(trackDuration, targetSec));
    trackCurrentTime = targetSec;

    if (activeMode === 'mp3' && audioEl) {
      audioEl.currentTime = targetSec;
    }

    updateProgressDisplay(trackCurrentTime, trackDuration);

    if (armLever && isPlaying) {
      const armAngle = 23.5 + (trackCurrentTime / trackDuration) * 14.5;
      armLever.style.setProperty('--arm-angle', armAngle.toFixed(2) + 'deg');
    }
  }

  // Bind Play/Pause to disc & control button
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePlayback();
    });
  });

  // Bind Seek to Progress Bar
  if (progressBar) {
    function handleSeekEvent(e) {
      const rect = progressBar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seekToTime(ratio * trackDuration);
    }

    progressBar.addEventListener('click', handleSeekEvent);

    // Hover tooltip with preview time
    progressBar.addEventListener('mousemove', (e) => {
      if (!progressTooltip) return;
      const rect = progressBar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const previewTime = ratio * trackDuration;
      progressTooltip.textContent = formatTime(previewTime);
      progressTooltip.style.left = (ratio * 100) + '%';
    });

    // Keyboard navigation (ArrowLeft / ArrowRight)
    progressBar.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekToTime(trackCurrentTime - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekToTime(trackCurrentTime + 5);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        togglePlayback();
      }
    });
  }

  // Volume & Mute control
  function applyVolume(vol) {
    currentVolume = Math.max(0, Math.min(1, vol));
    if (audioEl) audioEl.volume = currentVolume;
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    }
    updateVolumeIcon(currentVolume);
    try {
      localStorage.setItem('tatar_record_vol', currentVolume);
    } catch (e) {}
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      applyVolume(val);
      if (val > 0) previousVolume = val;
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener('click', () => {
      if (currentVolume > 0.01) {
        previousVolume = currentVolume;
        if (volumeSlider) volumeSlider.value = 0;
        applyVolume(0);
      } else {
        const restoreVal = previousVolume > 0.05 ? previousVolume : 0.85;
        if (volumeSlider) volumeSlider.value = restoreVal;
        applyVolume(restoreVal);
      }
    });
  }
})();

