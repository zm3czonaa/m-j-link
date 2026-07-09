const music = document.querySelector("#music");
const playlistAudio = document.querySelector("#playlist-audio");
const backgroundVideo = document.querySelector(".background-video");
const trackButtons = Array.from(document.querySelectorAll(".track-button"));
const currentTrackName = document.querySelector("#current-track-name");
const previousTrackButton = document.querySelector(".previous-track");
const nextTrackButton = document.querySelector(".next-track");
const moneyRain = document.querySelector(".money-rain");
const youtubeSubsCount = document.querySelector("#youtube-subs-count");
const youtubeViewsCount = document.querySelector("#youtube-views-count");
const audioGate = document.querySelector(".audio-gate");
const title = document.querySelector("h1");
const links = document.querySelector(".links");
const YOUTUBE_API_KEY = "AIzaSyCKR5LoVXVl3ZHQjD11zTwFF2riqmOYH38";
let activeTrackIndex = 0;
let moneyRainTimer;

const positionAudioGate = () => {
  if (!audioGate || !title || !links) return;

  const titleBottom = title.getBoundingClientRect().bottom;
  const linksTop = links.getBoundingClientRect().top;
  const midpoint = titleBottom + (linksTop - titleBottom) / 2;

  audioGate.style.setProperty("--gate-top", `${midpoint}px`);
};

const formatSubscriberCount = (count) =>
  Math.round(count)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const loadYoutubeSubscribers = async () => {
  if (!youtubeSubsCount || !youtubeViewsCount) return;

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "statistics");
    url.searchParams.set("forHandle", "@zm3czonaa");
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const response = await fetch(url);
    if (!response.ok) throw new Error("YouTube API request failed");

    const data = await response.json();
    const subscriberCount = data.items?.[0]?.statistics?.subscriberCount;
    const viewCount = data.items?.[0]?.statistics?.viewCount;
    if (!subscriberCount || !viewCount) throw new Error("YouTube statistics unavailable");

    youtubeSubsCount.textContent = formatSubscriberCount(Number(subscriberCount));
    youtubeViewsCount.textContent = formatSubscriberCount(Number(viewCount));
  } catch {
    youtubeSubsCount.textContent = "unavailable";
    youtubeViewsCount.textContent = "unavailable";
  }
};

const setActiveTrack = (index, shouldPlay = false) => {
  if (!playlistAudio || !trackButtons.length) return;

  activeTrackIndex = (index + trackButtons.length) % trackButtons.length;
  const activeButton = trackButtons[activeTrackIndex];

  trackButtons.forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
    button.classList.remove("is-playing");
  });

  playlistAudio.src = activeButton.dataset.src;
  currentTrackName.textContent = activeButton.dataset.title || activeButton.querySelector(".track-title")?.textContent || "";

  if (shouldPlay) {
    playActiveTrack();
  }
};

const playActiveTrack = async () => {
  if (!playlistAudio || !trackButtons.length) return;

  music?.pause();
  playlistAudio.volume = 0.175;

  try {
    await playlistAudio.play();
    trackButtons[activeTrackIndex]?.classList.add("is-playing");
  } catch {
    trackButtons[activeTrackIndex]?.classList.remove("is-playing");
  }
};

const toggleTrack = (index) => {
  if (!playlistAudio) return;

  if (index === activeTrackIndex && !playlistAudio.paused) {
    playlistAudio.pause();
    return;
  }

  if (index === activeTrackIndex && playlistAudio.paused) {
    playActiveTrack();
    return;
  }

  setActiveTrack(index, true);
};

const startFirstTrack = () => {
  if (!playlistAudio || !trackButtons.length) return;

  setActiveTrack(0);

  playActiveTrack();
};

const changeTrack = (direction) => {
  if (!playlistAudio || !trackButtons.length) return;

  const shouldPlay = !playlistAudio.paused || !document.body.classList.contains("is-waiting");
  setActiveTrack(activeTrackIndex + direction, shouldPlay);
};

const createMoneyIcon = () => {
  if (!moneyRain) return;

  const icon = document.createElement("span");
  icon.className = "money-icon";
  icon.textContent = Math.random() > 0.42 ? "💀" : "🔪";
  icon.style.setProperty("--money-left", `${Math.random() * 96}vw`);
  icon.style.setProperty("--money-size", `${22 + Math.random() * 18}px`);
  icon.style.setProperty("--money-duration", `${7 + Math.random() * 4}s`);
  icon.style.setProperty("--money-drift", `${(Math.random() - 0.5) * 190}px`);

  moneyRain.appendChild(icon);
  icon.addEventListener("animationend", () => icon.remove(), { once: true });
};

const startMoneyRain = () => {
  if (moneyRainTimer) return;

  createMoneyIcon();
  moneyRainTimer = window.setInterval(() => {
    if (moneyRain && moneyRain.children.length < 18) {
      createMoneyIcon();
    }
  }, 620);
};

const enterSite = () => {
  document.body.classList.remove("is-waiting");
  audioGate?.classList.add("is-hidden");
  backgroundVideo?.play();
  startFirstTrack();
  startMoneyRain();
};

trackButtons.forEach((button, index) => {
  button.addEventListener("click", () => toggleTrack(index));
});

previousTrackButton?.addEventListener("click", () => changeTrack(-1));
nextTrackButton?.addEventListener("click", () => changeTrack(1));

playlistAudio?.addEventListener("ended", () => {
  changeTrack(1);
});

playlistAudio?.addEventListener("pause", () => {
  trackButtons[activeTrackIndex]?.classList.remove("is-playing");
});

positionAudioGate();
window.addEventListener("resize", positionAudioGate);
loadYoutubeSubscribers();
setActiveTrack(activeTrackIndex);
music?.pause();
playlistAudio?.pause();
backgroundVideo?.pause();
audioGate?.addEventListener("click", enterSite, { once: true });
