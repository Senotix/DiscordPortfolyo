const fallbackConfig = {
  site: {
    title: "profile",
    theme: 1,
    nameMode: "displayName",
    description: "",
    backgroundUrl: "",
    backgroundBlur: 14,
    backgroundBrightness: 0.9,
    backgroundGrayscale: true,
    audio: { enabled: false, autoplay: false, src: "", volume: 0.35 }
  },
  discord: { enabled: false, profileUrl: "", refreshSeconds: 15 },
  links: []
};

const fallbackProfile = {
  name: "profile",
  avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  heroAvatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  status: "offline",
  activity: "Durum bekleniyor"
};

const iconClasses = {
  apple: "fa-brands fa-apple",
  behance: "fa-brands fa-behance",
  bluesky: "fa-brands fa-bluesky",
  codepen: "fa-brands fa-codepen",
  discord: "fa-brands fa-discord",
  dribbble: "fa-brands fa-dribbble",
  email: "fa-solid fa-envelope",
  facebook: "fa-brands fa-facebook",
  figma: "fa-brands fa-figma",
  globe: "fa-solid fa-globe",
  github: "fa-brands fa-github",
  gitlab: "fa-brands fa-gitlab",
  heart: "fa-solid fa-heart",
  instagram: "fa-brands fa-instagram",
  itch: "fa-brands fa-itch-io",
  kickstarter: "fa-brands fa-kickstarter-k",
  lastfm: "fa-brands fa-lastfm",
  link: "fa-solid fa-link",
  linkedin: "fa-brands fa-linkedin",
  mail: "fa-solid fa-envelope",
  medium: "fa-brands fa-medium",
  patreon: "fa-brands fa-patreon",
  paypal: "fa-brands fa-paypal",
  pinterest: "fa-brands fa-pinterest",
  reddit: "fa-brands fa-reddit",
  roblox: "fa-solid fa-square",
  snapchat: "fa-brands fa-snapchat",
  soundcloud: "fa-brands fa-soundcloud",
  spotify: "fa-brands fa-spotify",
  stackoverflow: "fa-brands fa-stack-overflow",
  star: "fa-solid fa-star",
  steam: "fa-brands fa-steam",
  telegram: "fa-brands fa-telegram",
  tiktok: "fa-brands fa-tiktok",
  twitch: "fa-brands fa-twitch",
  website: "fa-solid fa-globe",
  whatsapp: "fa-brands fa-whatsapp",
  x: "fa-brands fa-x-twitter",
  twitter: "fa-brands fa-x-twitter",
  youtube: "fa-brands fa-youtube"
};

const cdnIconSlugs = {
  apple: "apple",
  behance: "behance",
  bluesky: "bluesky",
  codepen: "codepen",
  discord: "discord",
  dribbble: "dribbble",
  facebook: "facebook",
  figma: "figma",
  github: "github",
  gitlab: "gitlab",
  instagram: "instagram",
  itch: "itchdotio",
  kickstarter: "kickstarter",
  lastfm: "lastdotfm",
  linkedin: "linkedin",
  medium: "medium",
  patreon: "patreon",
  paypal: "paypal",
  pinterest: "pinterest",
  reddit: "reddit",
  roblox: "roblox",
  snapchat: "snapchat",
  soundcloud: "soundcloud",
  spotify: "spotify",
  stackoverflow: "stackoverflow",
  steam: "steam",
  telegram: "telegram",
  tiktok: "tiktok",
  twitch: "twitch",
  whatsapp: "whatsapp",
  x: "x",
  twitter: "x",
  youtube: "youtube"
};

const statusMap = {
  online: "online",
  idle: "idle",
  dnd: "dnd",
  offline: "offline"
};

const $ = (selector) => document.querySelector(selector);

async function loadPageData() {
  try {
    const response = await fetch("/api/profile", { cache: "no-store" });
    if (!response.ok) throw new Error("profile request failed");
    const data = await response.json();
    const config = mergeConfig(fallbackConfig, data.config || {});
    return {
      config,
      profile: { ...fallbackProfile, ...data.profile }
    };
  } catch (_error) {
    const response = await fetch("config.json", { cache: "no-store" });
    const config = await response.json();
    const merged = mergeConfig(fallbackConfig, config);
    return {
      config: merged,
      profile: fallbackProfile
    };
  }
}

function mergeConfig(base, next) {
  return {
    ...base,
    ...next,
    site: { ...base.site, ...next.site, audio: { ...base.site.audio, ...next.site?.audio } },
    discord: { ...base.discord, ...next.discord },
    links: Array.isArray(next.links) ? next.links : base.links
  };
}

function applyProfile(config, profile) {
  document.title = config.site.title || profile.name;
  applyTheme(config.site.theme);
  applyBackground(config.site.backgroundUrl || profile.heroAvatar);
  const blur = Number.isFinite(Number(config.site.backgroundBlur)) ? Number(config.site.backgroundBlur) : 14;
  const brightness = Number.isFinite(Number(config.site.backgroundBrightness)) ? Number(config.site.backgroundBrightness) : 0.9;
  document.documentElement.style.setProperty("--blur", `${blur}px`);
  document.documentElement.style.setProperty("--brightness", brightness);
  document.documentElement.style.setProperty("--grayscale", config.site.backgroundGrayscale === false ? "0" : "1");

  const heroAvatar = $(".hero-avatar");
  const cardAvatar = $(".card-avatar");
  const displayName = getDisplayName(config, profile);
  cardAvatar.style.display = "block";
  heroAvatar.src = profile.heroAvatar || profile.avatar;
  cardAvatar.src = profile.avatar || profile.heroAvatar;
  heroAvatar.alt = `${profile.name} avatar`;
  cardAvatar.alt = `${profile.name} avatar`;
  heroAvatar.onerror = () => {
    heroAvatar.removeAttribute("src");
  };
  cardAvatar.onerror = () => {
    cardAvatar.style.display = "none";
  };

  $(".profile-title").textContent = displayName;
  $(".profile-name").textContent = displayName;
  $(".activity").textContent = profile.activity || "No activity";

  const description = $(".profile-description");
  const descriptionText = String(config.site.description || "").trim();
  description.textContent = descriptionText;
  description.hidden = !descriptionText;
  document.body.classList.toggle("has-description", Boolean(descriptionText));

  const statusDot = $(".status-dot");
  statusDot.className = `status-dot ${statusMap[profile.status] || "offline"}`;
}

function getDisplayName(config, profile) {
  if (config.site.nameMode === "username" && profile.username) return profile.username;
  return profile.name || profile.username || "profile";
}

function applyTheme(theme) {
  const themeNumber = Number(theme);
  const selectedTheme = [1, 2, 3, 4].includes(themeNumber) ? themeNumber : 1;
  document.body.dataset.theme = String(selectedTheme);
}

function applyBackground(url) {
  const background = $(".background");
  const video = $(".background-video");
  const source = String(url || "").trim();
  const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(source);

  if (isVideo) {
    document.documentElement.style.setProperty("--background-image", "none");
    background.classList.add("has-video");

    if (video.src !== source) {
      video.src = source;
      video.load();
    }

    video.play().catch(() => {});
    return;
  }

  background.classList.remove("has-video");
  video.pause();
  video.removeAttribute("src");
  video.load();
  document.documentElement.style.setProperty("--background-image", `url("${source}")`);
}

function renderLinks(links) {
  const container = $(".social-links");
  container.innerHTML = "";
  const activeLinks = links.filter((link) => link?.url);
  container.hidden = activeLinks.length === 0;

  activeLinks.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "social-link";
    anchor.dataset.icon = link.icon || "link";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.title = link.label || "Baglanti";
    anchor.setAttribute("aria-label", link.label || "Baglanti");

    const icon = createLinkIcon(link.icon);
    const label = document.createElement("span");
    label.textContent = link.label || "Baglanti";
    anchor.append(icon, label);
    container.append(anchor);
  });
}

function createLinkIcon(iconName) {
  const slug = cdnIconSlugs[iconName];

  if (slug) {
    const image = document.createElement("img");
    image.className = "cdn-icon";
    image.src = `https://cdn.simpleicons.org/${slug}/ffffff`;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.onerror = () => {
      const fallback = document.createElement("i");
      fallback.className = iconClasses[iconName] || iconClasses.link;
      fallback.setAttribute("aria-hidden", "true");
      image.replaceWith(fallback);
    };
    return image;
  }

  const icon = document.createElement("i");
  icon.className = iconClasses[iconName] || iconClasses.link;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function setupAudio(config) {
  const audio = $(".page-audio");
  const control = $(".sound-control");
  const button = $(".sound-button");
  const volume = $(".sound-volume");
  const icon = button.querySelector("i");
  const audioConfig = config.site.audio || {};

  if (!audioConfig.enabled || !audioConfig.src) {
    control.hidden = true;
    return;
  }

  audio.src = audioConfig.src;
  audio.volume = Math.min(Math.max(Number(audioConfig.volume) || 0.35, 0), 1);
  volume.value = String(audio.volume);

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    if (audio.volume === 0) {
      audio.muted = true;
      icon.className = "fa-solid fa-volume-xmark";
      return;
    }

    audio.muted = false;
    icon.className = audio.paused ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
  });

  button.addEventListener("click", async () => {
    if (audio.paused) {
      await playAudio(audio, icon);
      return;
    }

    audio.pause();
    icon.className = "fa-solid fa-volume-xmark";
  });

  if (audioConfig.autoplay) {
    playAudio(audio, icon).catch(() => {
      const startOnGesture = () => playAudio(audio, icon).catch(() => {});
      document.addEventListener("pointerdown", startOnGesture, { once: true });
      document.addEventListener("keydown", startOnGesture, { once: true });
    });
  }
}

async function playAudio(audio, icon) {
  audio.muted = false;
  await audio.play();
  icon.className = "fa-solid fa-volume-high";
}

async function init() {
  const { config, profile } = await loadPageData();
  applyProfile(config, profile);
  renderLinks(config.links);
  setupAudio(config);

  const refreshMs = Math.max(Number(config.discord.refreshSeconds) || 0, 0) * 1000;
  if (config.discord.enabled && refreshMs >= 5000) {
    setInterval(async () => {
      const next = await loadPageData();
      applyProfile(next.config, next.profile);
    }, refreshMs);
  }
}

init();
