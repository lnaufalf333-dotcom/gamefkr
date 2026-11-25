# ⚔️ SwordQuest — Petualangan Epik

Game petualangan action-platformer bergaya **Swordigo**, dibangun sepenuhnya dengan **HTML, CSS, dan JavaScript** murni. Tidak memerlukan framework atau dependency eksternal.

---

## 🎮 Fitur Game

| Fitur | Detail |
|---|---|
| **3 Level** | Hutan Awal → Gua Batu → Kastil Boss |
| **Sistem Combat** | Serangan pedang, sihir api, tameng blok |
| **Double Jump** | Tekan lompat 2× saat di udara |
| **Musuh** | Goblin, Skeleton, Boss (2 fase!) |
| **Kolektibel** | Koin 🪙, Potion HP ❤️, Potion MP 💎 |
| **Sistem EXP & Level Up** | Kalahkan musuh → naik level → stat meningkat |
| **Kamera Scrolling** | Smooth camera follow dengan parallax background |
| **Particle Effects** | Slash, magic, koin, death, level up |
| **Mobile Support** | On-screen buttons untuk perangkat touch |
| **HUD Lengkap** | HP bar, MP bar, EXP bar, skor, koin |

---

## 🕹️ Kontrol

| Tombol | Aksi |
|---|---|
| `← →` / Arrow Keys | Gerak kiri/kanan |
| `↑` / `W` / `Space` | Lompat (2× = Double Jump) |
| `Z` / `J` | Serangan pedang |
| `X` / `K` | Lempar bola api (butuh 15 MP) |
| `C` / `L` | Tameng (tahan untuk blok — kurangi damage 75%) |
| `P` / `Escape` | Pause |

---

## 📁 Struktur File

```
public/game/
├── index.html   # Struktur UI: menu, HUD, overlay, canvas
├── style.css    # Semua styling: menu, animasi, HUD, mobile
└── game.js      # Engine game: fisika, AI, render, sistem
```

---

## 🚀 Cara Menjalankan

### Langsung buka di browser:
```bash
# Cukup buka file index.html di browser modern
start public/game/index.html
```

### Via Laravel (jika project ini Laravel):
```
http://localhost:8000/game/
```

### Via server sederhana:
```bash
cd public/game
npx serve .
# atau
python -m http.server 3000
```

---

## 🏗️ Teknologi

```
HTML5     → Struktur halaman, Canvas element, Overlay system
CSS3      → Animasi UI, Parallax stars, Mobile responsive, HUD styling
JavaScript → Game engine: fisika, tile collision, AI, render, particle system
```

---

## 🎯 Tips Bermain

- Kumpulkan semua **koin** sebelum maju untuk menambah skor
- Gunakan **tameng** saat menyerang musuh melee untuk menghemat HP
- **Boss di Level 3** punya 2 fase — waspadai saat HP-nya setengah!
- **Portal** baru terbuka setelah **semua musuh** di level dikalahkan
- Ambil **Potion MP** agar bisa terus menggunakan sihir api

---

## 👨‍💻 Developer

**Fikri Game Studio** · 2026  
Dibuat dengan ❤️ menggunakan HTML · CSS · JavaScript

---

> Inspirasi: **Swordigo** by Touch Foo
