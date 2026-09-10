# senotix — Discord durumlu kişisel profil sayfası

Sunucusuz, bağımlılıksız, build gerektirmeyen kişisel profil sitesi.
Discord durumun ve aktiviten **gerçek zamanlı** (WebSocket) olarak görünür, site açılır açılmaz cache'ten profil çizilir.

![sunucusuz](https://img.shields.io/badge/sunucu-yok-brightgreen) ![build](https://img.shields.io/badge/build-gerekmez-blue) ![bağımlılık](https://img.shields.io/badge/bağımlılık-0-success)

## Özellikler

* 🟢 **Canlı Discord durumu** — Lanyard WebSocket ile anlık; oyun/Spotify/custom status değişince sayfa saniyesinde güncellenir, polling beklemez
* ⚡ **Anında açılış** — son profil localStorage'a cache'lenir, site milisaniyeler içinde dolu gelir
* 🎨 **4 hazır tema** — tek satırla değişir
* 🖼️ **Resim veya video arka plan** — blur / parlaklık / gri tonlama ayarlı
* 🎵 **Arka plan müziği** — ses seviyesi kontrolü, autoplay engellenirse ilk tıkla başlar
* 🔗 **Sosyal linkler** — Font Awesome ikonları, etiketle aç/kapa
* 🏷️ **Link önizlemesi (OG)** — Discord/Twitter/WhatsApp'ta kart görünür
* 📎 **Otomatik favicon** — Discord avatarın sekme ikonu olur
* 📦 **Sıfır bağımlılık, sıfır build** — 4 dosya, herhangi bir statik hostinge at, bitti

## Dosya yapısı

```text
├── index.html    ← OG etiketleri ve iskelet (nadiren düzenlenir)
├── style.css     ← temalar ve görünüm (dokunma gerekmez)
├── script.js     ← mantık (dokunma gerekmez)
└── config.js     ← HER ŞEY buradan yönetilir
```

## Kurulum

1. Dosyaları bir klasöre indir.
2. `config.js`'i kendine göre düzenle.
3. Yayınla — kurulum bu kadar.

## Yapılandırma — config.js

### site

| Alan                   | Açıklama                                                          | Varsayılan |
| ---------------------- | ----------------------------------------------------------------- | ---------- |
| `title`                | Tarayıcı sekmesi başlığı                                          | `""`       |
| `theme`                | Tema: `1` `2` `3` `4`                                             | `1`        |
| `nameMode`             | Sitede görünen büyük isim. Boş bırakılırsa Discord adı kullanılır | `""`       |
| `description`          | İsim altındaki açıklama. Boşsa gizlenir                           | `""`       |
| `backgroundUrl`        | Resim URL'i veya video dosyası/dış URL                            | `""`       |
| `backgroundBlur`       | Arka plan blur (px)                                               | `0`        |
| `backgroundBrightness` | Arka plan parlaklığı (`0.5`–`1.5`)                                | `1`        |
| `backgroundGrayscale`  | Arka plan siyah-beyaz olsun mu                                    | `false`    |
| `favicon`              | Sabit favicon. Boşsa Discord avatarı otomatik kullanılır          | `""`       |

### site.audio

| Alan       | Açıklama                              | Varsayılan |
| ---------- | ------------------------------------- | ---------- |
| `enabled`  | Ses kontrolü ve müzik açılır          | `true`     |
| `autoplay` | Sayfa açılınca müziği başlatmayı dene | `true`     |
| `src`      | Dosya yolu (`music.mp3`) veya tam URL | `""`       |
| `volume`   | `0`–`1` başlangıç seviyesi            | `0.35`     |

> Tarayıcı politikası gereği ilk ziyarette sesli autoplay engellenebilir.
> Engellenirse müzik, ziyaretçinin sayfada yaptığı **ilk tık/dokunma/tuşla** otomatik başlar.

### discord

| Alan             | Açıklama                                                         | Varsayılan |
| ---------------- | ---------------------------------------------------------------- | ---------- |
| `enabled`        | `false` → Discord kartı tamamen gizlenir, hiçbir isteğe çıkılmaz | `true`     |
| `profileUrl`     | Discord ID'n veya profil linkin. **Boşsa kart gizlenir**         | `""`       |
| `refreshSeconds` | WebSocket koparsa devreye giren yedek yenileme aralığı (min `5`) | `15`       |

### defaults

Discord verisi gelmezse gösterilen varsayılan bilgiler:

| Alan         | Açıklama                                |
| ------------ | --------------------------------------- |
| `name`       | Karttaki isim                           |
| `avatar`     | Karttaki küçük avatar                   |
| `heroAvatar` | Büyük avatar. Boşsa `avatar` kullanılır |
| `status`     | `online` / `idle` / `dnd` / `offline`   |
| `activity`   | Durum metni (örn. `"Yakında döner"`)    |

### links

```js
links: [
  { label: "GitHub", icon: "github", url: "https://github.com/kullanici" },
  { label: "Spotify", icon: "spotify", url: "https://open.spotify.com/user/..." },
  { label: "WhatsApp", icon: "fa-brands fa-whatsapp", url: "https://wa.me/90..." }
]
```

Hazır ikon adları:

```text
github
discord
spotify
youtube
instagram
telegram
tiktok
twitter
x
twitch
steam
reddit
snapchat
pinterest
roblox
email
website
```

Listede olmayan bir ikon için doğrudan Font Awesome class'ı yaz:

```js
icon: "fa-brands fa-whatsapp"
```

## Discord durumunun çalışması için

Durum ve aktivite verisi [Lanyard](https://discord.gg/lanyard) üzerinden gelir.

1. Durumunu göstermek istediğin Discord hesabıyla [discord.gg/lanyard](https://discord.gg/lanyard) sunucusuna katıl.
2. Discord'da **Ayarlar → Gizlilik ve Güvenlik → Aktivite durumu** açık olsun.

Katılmazsan isim/avatar yine de `defaults`'tan gösterilir; durum ve aktivite çalışmaz.

## Link önizlemesi (OG)

Discord/Twitter/WhatsApp tarayıcıları JavaScript çalıştırmadığı için önizleme metaları `index.html` içinde statik durur.

Yayına almadan önce şunları düzenle:

```html
<meta property="og:title" content="senotix">
<meta property="og:description" content="senotix — profil sayfası">
<meta property="og:image" content="https://...">
<meta property="og:url" content="https://site-adresin.com">
```

> `og:image` için tam URL kullanmalısın (`https://` ile başlamalı).

> Discord önizlemeleri agresif cache'ler. Metaları değiştirdikten sonra test ederken linki `?v=2` gibi bir parametreyle gönder; aksi halde eski önizlemeyi görebilirsin.

## Yayınlama

### GitHub Pages

Repoyu oluştur → **Settings → Pages → Branch: `main` /root → Save**

URL:

```text
https://kullanici.github.io/repo-adi/
```

### Netlify

[app.netlify.com/drop](https://app.netlify.com/drop) adresine gir ve klasörü sürükle.

### Cloudflare Pages

Pages → Create project → klasörü yükle.

Hepsi ücretsiz ve aynı 4 dosyayla çalışır.

### Yerel test

`file://` ile açmayın — `config.js` yüklenmez.

Şunlardan birini kullan:

```bash
npx serve .
```

veya:

```bash
python3 -m http.server 3000
```

Ardından tarayıcıdan:

```text
http://localhost:3000
```

adresine gir.

## Sorun giderme

| Belirti                        | Sebep / çözüm                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Discord kartı hiç yok          | `discord.profileUrl` boş veya `enabled: false`. Konsolda uyarı çıkar                 |
| İsim doğru ama aktivite yok    | `discord.gg/lanyard` sunucusuna katılmadın veya Discord'da aktivite paylaşımı kapalı |
| Müzik başlamıyor               | Tarayıcı autoplay engeli. Sayfada bir kez tıkla                                      |
| Link önizlemesi eski           | Discord cache'i. Linki `?v=2` parametresiyle gönder                                  |
| Profil bir saniye eski geliyor | localStorage cache. WS verisi gelince anında düzelir, normaldir                      |

## Nasıl çalışıyor?

### Açılış

Cache varsa profil anında çizilir → Lanyard REST hızlı veriyi getirir.

### Canlı bağlantı

```text
wss://api.lanyard.rest/socket
```

adresine WebSocket üzerinden abone olunur.

Her durum değişimi event olarak alınır ve sayfaya anında işlenir.

Bağlantı koparsa:

```text
2s → 4s → 8s → ... → 30s
```

şeklinde üstel beklemeyle yeniden bağlanılır.

### Yedek sistem

WebSocket bağlantısı düşük olduğunda `refreshSeconds` değerine göre REST polling devreye girer.

Sekme gizliyken gereksiz istek gönderilmez.

### Sunucu gerektirmez

Tüm istekler doğrudan ziyaretçinin tarayıcısından yapılır.

Site tamamen statik olarak çalışır.
