(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const site = config.site || {};
  const defaults = config.defaults || {};
  const DEFAULT_PROFILE = {
    name: defaults.name || site.nameMode || "",
    avatar: defaults.avatar || "",
    heroAvatar: defaults.heroAvatar || defaults.avatar || "",
    status: defaults.status || "offline",
    activity: defaults.activity || ""
  };

  const LANYARD_WS_URL = "wss://api.lanyard.rest/socket";
  const CACHE_PREFIX = "profile-cache:";

  const ICONS = {
    github: "fa-brands fa-github",
    discord: "fa-brands fa-discord",
    spotify: "fa-brands fa-spotify",
    youtube: "fa-brands fa-youtube",
    instagram: "fa-brands fa-instagram",
    telegram: "fa-brands fa-telegram",
    tiktok: "fa-brands fa-tiktok",
    twitter: "fa-brands fa-x-twitter",
    x: "fa-brands fa-x-twitter",
    twitch: "fa-brands fa-twitch",
    steam: "fa-brands fa-steam",
    reddit: "fa-brands fa-reddit",
    snapchat: "fa-brands fa-snapchat",
    pinterest: "fa-brands fa-pinterest",
    roblox: "fa-solid fa-cube",
    email: "fa-solid fa-envelope",
    website: "fa-solid fa-globe",
    link: "fa-solid fa-link"
  };

  const body = document.body;
  const discordCard = document.getElementById("discordCard");
  const heroAvatar = document.getElementById("heroAvatar");
  const profileTitle = document.getElementById("profileTitle");
  const profileDescription = document.getElementById("profileDescription");
  const cardAvatar = document.getElementById("cardAvatar");
  const statusDot = document.getElementById("statusDot");
  const profileName = document.getElementById("profileName");
  const activityText = document.getElementById("activity");
  const socialLinks = document.getElementById("socialLinks");
  const background = document.getElementById("background");
  const backgroundVideo = document.getElementById("backgroundVideo");
  const soundControl = document.getElementById("soundControl");
  const soundButton = document.getElementById("soundButton");
  const soundVolume = document.getElementById("soundVolume");
  const audio = document.getElementById("audioPlayer");

  let faviconLink = null;

  function setFavicon(href) {
    if (!href) return;

    if (!faviconLink) {
      faviconLink = document.querySelector('link[rel="icon"]') || document.createElement("link");
      faviconLink.rel = "icon";
      document.head.append(faviconLink);
    }

    faviconLink.href = href;
  }

  function applySite() {
    document.title = site.title || "Profil";
    if (site.theme) body.dataset.theme = String(site.theme);

    if (site.description) {
      profileDescription.textContent = site.description;
      profileDescription.hidden = false;
      body.classList.add("has-description");
    }

    if (site.favicon) setFavicon(site.favicon);

    applyBackground();
    applyAudio();
    renderLinks();
  }

  function applyBackground() {
    const root = document.documentElement.style;
    root.setProperty("--blur", `${site.backgroundBlur || 0}px`);
    root.setProperty("--brightness", String(site.backgroundBrightness ?? 1));
    root.setProperty("--grayscale", site.backgroundGrayscale ? "1" : "0");

    const url = site.backgroundUrl || "";
    if (!url) return;

    if (/\.(mp4|webm|ogv|ogg|mov)(\?|#|$)/i.test(url)) {
      background.classList.add("has-video");
      backgroundVideo.src = url;
      backgroundVideo.play().catch(() => {});
      return;
    }

    background.style.setProperty("--background-image", `url("${url}")`);
  }

  const ICON_VOLUME =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
    '<path d="M3 9v6h4l5 5V4L7 9H3z"/>' +
    '<path d="M16 8a5 5 0 0 1 0 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const ICON_MUTED =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
    '<path d="M3 9v6h4l5 5V4L7 9H3z"/>' +
    '<path d="m16 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

  function clampVolume(value) {
    const number = Number(value);
    const safe = Number.isFinite(number) ? number : 0.35;
    return Math.min(Math.max(safe, 0), 1);
  }

  function updateSoundIcon() {
    soundButton.innerHTML = audio.muted || audio.volume === 0 ? ICON_MUTED : ICON_VOLUME;
  }

  let interactionUnlockBound = false;

  function startOnFirstInteraction() {
    if (interactionUnlockBound) return;
    interactionUnlockBound = true;

    const events = ["pointerdown", "keydown", "touchstart"];

    function unlock() {
      events.forEach((name) => document.removeEventListener(name, unlock, true));
      audio.muted = false;
      audio.play().then(updateSoundIcon).catch(updateSoundIcon);
    }

    events.forEach((name) => document.addEventListener(name, unlock, true));
  }

  function attemptAutoplay() {
    const play = audio.play();
    if (play && typeof play.catch === "function") {
      play.catch(startOnFirstInteraction);
    }
  }

  function applyAudio() {
    const cfg = site.audio || {};
    if (!cfg.enabled || !cfg.src) return;

    audio.src = cfg.src;
    audio.volume = clampVolume(cfg.volume);

    soundControl.hidden = false;
    soundVolume.value = String(audio.volume);
    updateSoundIcon();

    if (cfg.autoplay) attemptAutoplay();
  }

  soundButton.addEventListener("click", () => {
    if (audio.paused) {
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      audio.muted = !audio.muted;
    }
    updateSoundIcon();
  });

  soundVolume.addEventListener("input", () => {
    audio.volume = clampVolume(soundVolume.value);
    audio.muted = audio.volume === 0;
  });

  audio.addEventListener("volumechange", updateSoundIcon);

  function renderLinks() {
    (config.links || []).forEach((link) => {
      if (!link?.url) return;

      const iconKey = String(link.icon || "").trim();
      const anchor = document.createElement("a");
      anchor.className = "social-link";
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.title = link.label || link.url;
      anchor.dataset.icon = iconKey.startsWith("fa-") ? "" : iconKey.toLowerCase();

      const icon = document.createElement("i");
      icon.className = iconKey.startsWith("fa-")
        ? iconKey
        : (ICONS[iconKey.toLowerCase()] || ICONS.link);
      icon.setAttribute("aria-hidden", "true");
      anchor.append(icon);

      const label = document.createElement("span");
      label.textContent = link.label || "";
      anchor.append(label);

      socialLinks.append(anchor);
    });
  }

  let userId = "";
  let currentProfile = null;
  let socket = null;
  let wsAlive = false;
  let heartbeatTimer = 0;
  let reconnectTimer = 0;
  let reconnectDelay = 2000;
  let pollTimer = 0;

  async function fetchJson(url, timeoutMs = 8000) {
    const signal = typeof AbortSignal !== "undefined" && AbortSignal.timeout
      ? AbortSignal.timeout(timeoutMs)
      : undefined;
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    return response.json();
  }

  function profileFromLanyardData(data) {
    if (!data?.discord_user) return null;

    const user = data.discord_user;
    const avatar = buildAvatarUrl(user);

    return {
      name: user.global_name || user.display_name || user.username || DEFAULT_PROFILE.name,
      avatar: avatar || DEFAULT_PROFILE.avatar,
      heroAvatar: avatar || DEFAULT_PROFILE.heroAvatar,
      status: data.discord_status || "offline",
      activity: getActivityText(data) || "No activity"
    };
  }

  async function fetchLanyardProfile(id) {
    const response = await fetchJson(`https://api.lanyard.rest/v1/users/${id}`);
    if (!response?.success || !response.data?.discord_user) return null;
    return profileFromLanyardData(response.data);
  }

  function applyProfile(patch) {
    if (!patch) return;

    currentProfile = { ...(currentProfile || DEFAULT_PROFILE), ...patch };
    renderProfile(currentProfile);

    if (userId) {
      try {
        localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(currentProfile));
      } catch (_error) {}
    }
  }

  function loadCachedProfile() {
    if (!userId) return;

    try {
      const raw = localStorage.getItem(CACHE_PREFIX + userId);
      if (raw) applyProfile(JSON.parse(raw));
    } catch (_error) {}
  }

  function socketSend(payload) {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    } catch (_error) {}
  }

  function connectSocket() {
    if (!userId || !("WebSocket" in window)) return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    clearTimeout(reconnectTimer);

    try {
      socket = new WebSocket(LANYARD_WS_URL);
    } catch (_error) {
      scheduleReconnect();
      return;
    }

    socket.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (_error) {
        return;
      }

      if (message.op === 1) {
        const interval = Number(message.d?.heartbeat_interval) || 30000;
        clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => socketSend({ op: 3 }), interval);
        socketSend({ op: 2, d: { subscribe_to_id: userId } });
        return;
      }

      if (message.op === 0 && message.d?.discord_user) {
        wsAlive = true;
        reconnectDelay = 2000;
        applyProfile(profileFromLanyardData(message.d));
      }
    });

    socket.addEventListener("close", () => {
      wsAlive = false;
      clearInterval(heartbeatTimer);
      scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      try {
        socket.close();
      } catch (_error) {}
    });
  }

  function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectSocket, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  }

  function getRefreshSeconds() {
    const value = Number(config.discord?.refreshSeconds);
    if (!Number.isFinite(value) || value <= 0) return 15;
    return Math.max(5, value);
  }

  async function pollProfile() {
    if (wsAlive || !userId || document.hidden) return;

    try {
      applyProfile(await fetchLanyardProfile(userId));
    } catch (_error) {}
  }

  function startPolling() {
    clearInterval(pollTimer);
    pollTimer = setInterval(pollProfile, getRefreshSeconds() * 1000);
  }

  function extractDiscordUserId(value) {
    const match = String(value || "").trim().match(/\d{17,20}/);
    return match ? match[0] : "";
  }

  function toDiscordStatus(value) {
    const text = String(value || "").toLowerCase();
    if (text === "online") return "online";
    if (text === "idle") return "idle";
    if (text === "offline") return "offline";
    if (text === "dnd" || text === "do not disturb" || text === "do-not-disturb") return "dnd";
    return "";
  }

  function buildAvatarUrl(user) {
    if (!user?.id || !user?.avatar) return "";
    const extension = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
  }

  function getActivityText(data) {
    const activities = Array.isArray(data?.activities) ? data.activities : [];
    const customStatus = activities.find((activity) => activity.type === 4);
    const activity = activities.find((item) => item.type !== 4);

    if (activity?.name) {
      if (activity.type === 2) return `Listening to ${activity.name}`;
      if (activity.type === 3) return `Watching ${activity.name}`;
      if (activity.type === 5) return `Competing in ${activity.name}`;
      return `Playing ${activity.name}`;
    }

    return customStatus?.state || "";
  }

  function renderProfile(profile) {
    profileTitle.textContent = site.nameMode || profile.name || DEFAULT_PROFILE.name;
    profileName.textContent = profile.name || DEFAULT_PROFILE.name;
    activityText.textContent = profile.activity || DEFAULT_PROFILE.activity;
    statusDot.className = `status-dot ${toDiscordStatus(profile.status) || "offline"}`;

    const cardUrl = profile.avatar || DEFAULT_PROFILE.avatar;
    if (cardUrl) {
      cardAvatar.src = cardUrl;
      cardAvatar.hidden = false;
    }

    const heroUrl = profile.heroAvatar || profile.avatar || DEFAULT_PROFILE.heroAvatar;
    if (heroUrl) heroAvatar.src = heroUrl;

    if (!site.favicon) setFavicon(heroUrl || cardUrl);
  }

  async function initDiscord() {
    const discord = config.discord || {};
    userId = extractDiscordUserId(discord.profileUrl || discord.userId || "");

    if (!discord.enabled || !userId) {
      if (discord.enabled && !userId) {
        console.warn("config.js → discord.profileUrl boş veya geçersiz. Discord ID'ni yaz.");
      }
      discordCard.hidden = true;
      const fallbackName = site.nameMode || DEFAULT_PROFILE.name;
      if (fallbackName) profileTitle.textContent = fallbackName;
      if (DEFAULT_PROFILE.heroAvatar) {
        heroAvatar.src = DEFAULT_PROFILE.heroAvatar;
        setFavicon(DEFAULT_PROFILE.heroAvatar);
      }
      return;
    }

    discordCard.hidden = false;
    loadCachedProfile();
    connectSocket();
    startPolling();

    try {
      const profile = await fetchLanyardProfile(userId);
      if (profile) {
        applyProfile(profile);
      } else if (!currentProfile) {
        console.warn("Lanyard bu hesabı bulamadı. discord.gg/lanyard sunucusuna katıldığından emin ol.");
        renderProfile(DEFAULT_PROFILE);
      }
    } catch (_error) {}
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (!socket || socket.readyState === WebSocket.CLOSED) connectSocket();
    if (!wsAlive) pollProfile();
  });

  applySite();
  initDiscord();
})();