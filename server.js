const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, "config.json");
const DEFAULT_PROFILE = {
  name: "Discord User",
  username: "",
  avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  heroAvatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  status: "offline",
  activity: "Durum bekleniyor"
};

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/config") {
      sendJson(res, await readConfig());
      return;
    }

    if (url.pathname === "/api/profile") {
      const config = await readConfig();
      const profile = await resolveDiscordProfile(config);
      sendJson(res, { config, profile });
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, { error: error.message || "sunucu hatasi" }, 500);
  }
}

async function serveStatic(urlPath, res) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(ROOT, decodeURIComponent(requestedPath)));

  if (!filePath.startsWith(ROOT)) {
    sendText(res, "Forbidden", 403);
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(data);
  } catch (_error) {
    sendText(res, "Not found", 404);
  }
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, text, status = 200) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    ".aac": "audio/aac",
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webm": "video/webm",
    ".webp": "image/webp"
  };
  return types[extension] || "application/octet-stream";
}

async function readConfig() {
  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

async function resolveDiscordProfile(config) {
  const userId = extractDiscordUserId(config.discord?.profileUrl || config.discord?.userId || "");

  if (!config.discord?.enabled || !userId) {
    return DEFAULT_PROFILE;
  }

  const [japiResult, lanyardResult, discordDogResult] = await Promise.allSettled([
    fetchJapiProfile(userId),
    fetchLanyardProfile(userId),
    fetchDiscordDogProfile(userId)
  ]);

  const japiProfile = japiResult.status === "fulfilled" ? japiResult.value : null;
  const lanyardProfile = lanyardResult.status === "fulfilled" ? lanyardResult.value : null;
  const discordDogProfile = discordDogResult.status === "fulfilled" ? discordDogResult.value : null;

  return {
    ...DEFAULT_PROFILE,
    userId,
    ...japiProfile,
    ...lanyardProfile,
    ...discordDogProfile
  };
}

async function fetchLanyardProfile(userId) {
  const response = await fetchJson(`https://api.lanyard.rest/v1/users/${userId}`);
  if (!response?.success || !response.data?.discord_user) return null;

  const data = response.data;
  const user = data.discord_user;
  const avatar = buildAvatarUrl(user);

  return {
    name: user.global_name || user.display_name || user.username || DEFAULT_PROFILE.name,
    username: user.username || "",
    avatar: avatar || DEFAULT_PROFILE.avatar,
    heroAvatar: avatar || DEFAULT_PROFILE.heroAvatar,
    status: data.discord_status || "offline",
    activity: getActivityText(data) || "No activity",
    source: "lanyard"
  };
}

async function fetchJapiProfile(userId) {
  const response = await fetchJson(`https://japi.rest/discord/v1/user/${userId}`);
  if (!response?.data) return null;

  const user = response.data;
  const presence = response.presence && !response.presence.error ? response.presence : null;
  const avatar = user.avatarURL || user.defaultAvatarURL || DEFAULT_PROFILE.avatar;

  return {
    name: user.global_name || user.display_name || user.username || DEFAULT_PROFILE.name,
    username: user.username || "",
    avatar,
    heroAvatar: avatar,
    status: presence?.status || "offline",
    activity: getActivityText(presence) || "No activity",
    source: presence ? "japi-presence" : "japi-profile"
  };
}

async function fetchDiscordDogProfile(userId) {
  const url = `https://discord.dog/api/oembed?url=${encodeURIComponent(`https://discord.dog/${userId}`)}`;
  const response = await fetchJson(url);
  if (!response?.author_name) return null;

  const parts = response.author_name
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const statusIndex = parts.findIndex((part) => toDiscordStatus(part));
  if (statusIndex === -1) return null;

  const name = parts[0] || DEFAULT_PROFILE.name;
  const username = parts.find((part) => part.startsWith("@"))?.slice(1) || "";
  const activityName = parts.slice(statusIndex + 1).join(" · ");

  return {
    name,
    username,
    status: toDiscordStatus(parts[statusIndex]),
    activity: activityName ? `Playing ${activityName}` : "No activity",
    source: "discord.dog"
  };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "discord-profile-page"
      }
    });

    if (!response.ok) return null;
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function toDiscordStatus(value) {
  const text = String(value || "").toLowerCase();

  if (text === "online") return "online";
  if (text === "idle") return "idle";
  if (text === "offline") return "offline";
  if (text === "dnd" || text === "do not disturb" || text === "do-not-disturb") return "dnd";

  return "";
}

function extractDiscordUserId(value) {
  const text = String(value || "").trim();
  const match = text.match(/\d{17,20}/);
  return match ? match[0] : "";
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

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`Profil sitesi hazir: http://localhost:${PORT}`);
});
