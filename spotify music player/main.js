document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("player");
  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const progress = document.getElementById("progress");
  const progressFill = document.getElementById("progressFill");
  const currentTime = document.getElementById("currentTime");
  const songName = document.getElementById("songName");
  const artistName = document.getElementById("artistName");
  const currentCover = document.getElementById("currentCover");
  const duration = document.getElementById("duration");
  const songCards = [...document.querySelectorAll(".song-card")];
  const navButtons = [...document.querySelectorAll(".pages")];
  const nextBtn = document.getElementById("nextBtn");
  const previousBtn = document.getElementById("previousBtn");

  let isPlaying = false;
  let elapsed = 0;
  let timer = null;
  let selectedIndex = -1;
  const trackLength = 211; // 3:31 demo duration

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function updateProgress() {
    const percent = Math.min((elapsed / trackLength) * 100, 100);
    progressFill.style.width = `${percent}%`;
    currentTime.textContent = formatTime(elapsed);
  }

  function setPlaying(playing) {
    isPlaying = playing;
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");

    if (playing) {
      playIcon.innerHTML = '<path d="M3 2h3v12H3zM10 2h3v12h-3z"></path>';
      clearInterval(timer);
      timer = setInterval(() => {
        elapsed += 1;
        if (elapsed >= trackLength) {
          elapsed = 0;
          setPlaying(false);
        }
        updateProgress();
      }, 1000);
    } else {
      playIcon.innerHTML = '<path d="M4.018 14L14.41 8 4.018 2z"></path>';
      clearInterval(timer);
    }
  }

  function selectSong(index, autoplay = false) {
    const card = songCards[index];
    if (!card) return;

    selectedIndex = index;
    songName.textContent = card.dataset.title;
    artistName.textContent = card.dataset.artist;
    currentCover.src = card.dataset.cover;
    currentCover.alt = `${card.dataset.title} album cover`;
    elapsed = 0;
    updateProgress();

    songCards.forEach(item => item.classList.remove("selected"));
    card.classList.add("selected");

    if (autoplay) setPlaying(true);
  }

  playBtn.addEventListener("click", () => {
    setPlaying(!isPlaying);
  });

  nextBtn.addEventListener("click", () => {
    const nextIndex = selectedIndex < songCards.length - 1 ? selectedIndex + 1 : 0;
    selectSong(nextIndex, true);
  });

  previousBtn.addEventListener("click", () => {
    const previousIndex = selectedIndex > 0 ? selectedIndex - 1 : songCards.length - 1;
    selectSong(previousIndex, true);
  });

  songCards.forEach((card, index) => {
    card.addEventListener("click", () => selectSong(index, true));
  });

  progress.addEventListener("click", event => {
    const rect = progress.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    elapsed = Math.round(ratio * trackLength);
    updateProgress();
  });

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      navButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Lightweight vanilla-JS dragging. No jQuery or jQuery UI dependency is required.
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  player.addEventListener("pointerdown", event => {
    if (event.target.closest("button") && !event.target.closest(".drag-handle")) return;

    const rect = player.getBoundingClientRect();
    dragging = true;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    player.setPointerCapture(event.pointerId);
    player.classList.add("dragging");
  });

  player.addEventListener("pointermove", event => {
    if (!dragging) return;

    const maxX = window.innerWidth - player.offsetWidth - 8;
    const maxY = window.innerHeight - player.offsetHeight - 8;
    const x = Math.max(8, Math.min(event.clientX - offsetX, maxX));
    const y = Math.max(8, Math.min(event.clientY - offsetY, maxY));

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
    player.style.transform = "none";
  });

  function stopDragging() {
    dragging = false;
    player.classList.remove("dragging");
  }

  player.addEventListener("pointerup", stopDragging);
  player.addEventListener("pointercancel", stopDragging);

  window.addEventListener("resize", () => {
    if (!player.style.left) return;
    const maxX = Math.max(8, window.innerWidth - player.offsetWidth - 8);
    const maxY = Math.max(8, window.innerHeight - player.offsetHeight - 8);
    player.style.left = `${Math.min(parseFloat(player.style.left), maxX)}px`;
    player.style.top = `${Math.min(parseFloat(player.style.top), maxY)}px`;
  });

  updateProgress();
});
