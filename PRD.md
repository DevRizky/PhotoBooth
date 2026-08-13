# PRODUCT REQUIREMENTS DOCUMENT

## Personal Privacy-First Web Photo Booth

**Product Version:** 1.0
**Document Version:** 1.0
**Platform:** Web / PWA
**Target:** Personal Use
**Architecture:** Client-Side / Local-First
**Primary Technology:** React + TypeScript + Vite
**Status:** Development Specification

---

# 1. Executive Summary

Personal Web Photo Booth adalah aplikasi photo booth berbasis web yang memungkinkan pengguna mengambil foto menggunakan kamera perangkat, memilih dan mengustomisasi frame/layout, melakukan editing, kemudian menghasilkan foto final berkualitas tinggi yang dapat diunduh.

Produk dirancang dengan prinsip:

> **Capture locally. Edit locally. Render locally. Export locally.**

Foto pengguna tidak perlu dikirim ke server selama workflow normal.

Aplikasi dapat digunakan melalui:

* Laptop
* Desktop
* Tablet
* Smartphone
* External webcam
* Built-in webcam

Target penggunaan utama adalah perangkat laptop/desktop yang digunakan sebagai personal photo booth.

---

# 2. Product Vision

Membangun photo booth berbasis browser yang memberikan pengalaman seperti aplikasi photo booth profesional tetapi tetap:

* Sederhana
* Cepat
* Modern
* Customizable
* Offline-capable
* Privacy-first

Pengguna tidak perlu:

* Membuat akun.
* Login.
* Meng-upload foto.
* Menginstal aplikasi desktop.
* Menggunakan server untuk memproses foto.

---

# 3. Product Goals

## Primary Goals

1. Mengakses kamera melalui browser.
2. Mengambil satu atau beberapa foto.
3. Menyediakan countdown sebelum capture.
4. Menyediakan retake.
5. Menyediakan berbagai frame.
6. Menyediakan berbagai layout.
7. Memungkinkan custom ukuran canvas.
8. Memungkinkan custom photo slot.
9. Memungkinkan editing foto.
10. Menghasilkan final image berkualitas tinggi.
11. Mengunduh hasil dalam JPG/PNG/WebP.
12. Memproses foto secara lokal.
13. Mendukung penggunaan offline setelah aplikasi tercache.
14. Menyediakan pengalaman fullscreen/kiosk.

## Secondary Goals

1. Custom frame builder.
2. Favorite frame.
3. Custom text.
4. Logo.
5. Decoration/sticker.
6. Filter.
7. Undo/redo.
8. Export presets.
9. Local settings persistence.
10. Installable PWA.

---

# 4. Non-Goals

Versi pertama tidak menyediakan:

* User account.
* Login.
* Cloud photo gallery.
* Cloud photo backup.
* Social media authentication.
* Server-side photo processing.
* Facial recognition.
* Face tracking berbasis server.
* AI image processing berbasis cloud.
* Advertising.
* Photo analytics.
* User tracking.
* Payment.
* Multi-user account system.

---

# 5. Privacy Philosophy

Privacy adalah bagian inti dari produk, bukan fitur tambahan.

## Prinsip utama

```text
Camera
   ↓
Browser
   ↓
Memory
   ↓
Editor
   ↓
Canvas
   ↓
Final Image
   ↓
Download
```

Tidak:

```text
Camera
   ↓
Internet
   ↓
Server
   ↓
Database
```

---

# 6. Privacy Requirements

Aplikasi harus memenuhi:

### PR-001

Foto tidak boleh di-upload secara otomatis.

### PR-002

Foto tidak boleh disimpan ke database server.

### PR-003

Foto tidak boleh dikirim ke third-party image processing API.

### PR-004

Camera stream hanya aktif ketika fitur camera sedang digunakan.

### PR-005

Camera stream harus dihentikan setelah user keluar dari camera mode.

### PR-006

Temporary photo data harus dibersihkan ketika session selesai.

### PR-007

Local storage hanya digunakan untuk data non-sensitive seperti preferences.

### PR-008

Custom frame dapat disimpan secara lokal.

### PR-009

Aplikasi harus memberikan informasi kepada user bahwa foto diproses secara lokal.

---

# 7. Privacy Boundary

Arsitektur privacy:

```text
┌───────────────────────────────────────────┐
│              USER DEVICE                  │
│                                           │
│   Webcam                                  │
│      │                                    │
│      ▼                                    │
│ MediaDevices API                          │
│      │                                    │
│      ▼                                    │
│ Camera Controller                         │
│      │                                    │
│      ▼                                    │
│ Photo Session                             │
│      │                                    │
│      ▼                                    │
│ Photo Editor                              │
│      │                                    │
│      ▼                                    │
│ Canvas Renderer                            │
│      │                                    │
│      ▼                                    │
│ Blob / File                               │
│      │                                    │
│      ▼                                    │
│ Local Download                            │
│                                           │
└───────────────────────────────────────────┘

             NO PHOTO UPLOAD
```

---

# 8. Target Users

## Primary User

Individual user yang ingin menggunakan laptop/PC sebagai photo booth.

## Secondary User

Pengguna tablet/mobile yang ingin mengambil foto melalui browser.

---

# 9. User Journey

```text
HOME
 ↓
START
 ↓
CAMERA SETUP
 ↓
PHOTO CONFIGURATION
 ↓
FRAME SELECTION
 ↓
CAMERA PREVIEW
 ↓
COUNTDOWN
 ↓
CAPTURE
 ↓
PHOTO REVIEW
 ↓
EDITOR
 ↓
FINAL PREVIEW
 ↓
EXPORT
 ↓
DOWNLOAD
 ↓
NEW SESSION
```

---

# 10. Application Structure

Aplikasi memiliki beberapa screen utama:

```text
/
├── Home
│
├── /booth
│   ├── Camera Setup
│   ├── Configuration
│   ├── Camera
│   └── Capture
│
├── /editor
│
├── /result
│
├── /settings
│
└── /privacy
```

---

# 11. Home Screen

Home screen harus sederhana dan premium.

Komponen:

```text
Logo
Application Name
Description

[ START PHOTO BOOTH ]

[ SETTINGS ]

Privacy Indicator
```

Contoh:

```text
PERSONAL PHOTO BOOTH

Create your memories privately.

Your photos stay on this device.

[ START ]
```

---

# 12. Camera Permission

Sebelum kamera aktif, tampilkan privacy explanation.

```text
Camera Access

The camera is used only to capture
your photos.

Photos are processed locally in
your browser.

[ ALLOW CAMERA ]
```

Jika ditolak:

```text
Camera permission is required.

Please enable camera access
in browser settings.

[ TRY AGAIN ]
```

---

# 13. Camera Setup

Pengguna dapat memilih:

### Camera

```text
Built-in Camera
External Webcam
Other Camera
```

### Resolution

```text
640 × 480
1280 × 720
1920 × 1080
Maximum Available
```

### Mirror

```text
ON / OFF
```

Default:

**ON**

---

# 14. Aspect Ratio

Preset:

```text
1:1
4:5
3:4
4:3
9:16
16:9
Custom
```

Aspect ratio digunakan untuk menentukan camera crop dan output canvas.

---

# 15. Photo Session Configuration

Pengguna menentukan jumlah foto.

Preset:

```text
1
2
3
4
6
8
```

Custom:

```text
1 – 12 photos
```

---

# 16. Countdown Configuration

Preset:

```text
3 sec
5 sec
10 sec
```

Custom:

```text
1 – 30 sec
```

Countdown harus ditampilkan secara visual.

---

# 17. Capture Experience

Flow:

```text
READY
 ↓
3
 ↓
2
 ↓
1
 ↓
FLASH
 ↓
CAPTURE
```

Optional:

* Shutter sound
* Countdown sound
* Flash animation

---

# 18. Capture Preview

Camera screen terdiri dari:

```text
┌──────────────────────────────────┐
│                                  │
│          CAMERA PREVIEW          │
│                                  │
│                3                 │
│                                  │
├──────────────────────────────────┤
│ ● Photo 1                        │
│ ○ Photo 2                        │
│ ○ Photo 3                        │
│ ○ Photo 4                        │
├──────────────────────────────────┤
│ [ CANCEL ]          [ SETTINGS ] │
└──────────────────────────────────┘
```

---

# 19. Photo Review

Setelah capture selesai:

```text
YOUR PHOTOS

┌─────┐ ┌─────┐
│  01 │ │  02 │
└─────┘ └─────┘

┌─────┐ ┌─────┐
│  03 │ │  04 │
└─────┘ └─────┘

[ RETAKE ]       [ EDIT ]
```

---

# 20. Retake

User dapat melakukan:

### Retake All

Menghapus seluruh captured photos.

### Retake One

Mengganti satu foto.

Contoh:

```text
Photo 1 ✓
Photo 2 ✓
Photo 3 ✕

[ RETAKE PHOTO 3 ]
```

---

# 21. Frame System

Frame adalah komponen inti.

Frame harus bersifat data-driven.

Tidak diperbolehkan membuat logic khusus untuk setiap frame.

Struktur:

```text
Frame
├── Canvas
├── Background
├── Photo Slots
├── Text Layers
├── Decoration Layers
└── Overlay
```

---

# 22. Frame Categories

Kategori default:

```text
Classic
Minimal
Film
Polaroid
Vintage
Retro
Modern
Social
Birthday
Wedding
Seasonal
Custom
```

---

# 23. Frame Size

Preset:

```text
1080 × 1080
1080 × 1350
1080 × 1920
1200 × 1800
1800 × 1200
600 × 1800
```

Custom:

```text
Width
Height
```

Range yang diperbolehkan:

```text
256 – 6000 px
```

Untuk mencegah penggunaan memory berlebihan.

---

# 24. Frame Layout

Layout dapat berupa:

### Single

1 photo.

### Grid

2 / 4 / 6 / 8 photos.

### Film Strip

Vertical photos.

### Horizontal Strip

Horizontal photos.

### Polaroid

Photo dengan frame individual.

### Freeform

User dapat menentukan posisi setiap photo.

---

# 25. Frame Configuration

Contoh struktur data:

```text
{
  id: "classic-4",
  name: "Classic Four",
  category: "classic",

  canvas: {
    width: 1200,
    height: 1800
  },

  background: {
    type: "solid",
    value: "#FFFFFF"
  },

  slots: [
    {
      id: "photo-1",
      x: 100,
      y: 100,
      width: 500,
      height: 700,
      radius: 20,
      rotation: 0
    }
  ],

  layers: []
}
```

---

# 26. Photo Slot

Photo slot mempunyai:

```text
id
x
y
width
height
rotation
radius
scale
crop
objectFit
```

Object fit:

```text
cover
contain
fill
```

Default:

**cover**

---

# 27. Frame Customization

User dapat mengubah:

### Canvas

* Width
* Height

### Layout

* Padding
* Gap
* Photo size
* Position

### Photo

* Scale
* Crop
* Rotation
* Radius

### Border

* Width
* Color
* Radius

---

# 28. Background

Jenis background:

### Solid

Color picker.

### Gradient

* Linear
* Radial

### Image

Upload image dari device.

### Transparent

Untuk PNG.

---

# 29. Text Layer

User dapat menambahkan:

```text
Text
Font
Size
Weight
Color
Alignment
Letter Spacing
Line Height
Opacity
Rotation
Position
```

---

# 30. Logo Layer

Supported:

```text
PNG
JPG
WebP
SVG
```

Controls:

```text
Position
Scale
Opacity
Rotation
```

Logo diproses secara lokal.

---

# 31. Decoration Layer

Elements:

```text
Heart
Star
Circle
Square
Line
Sparkle
Flower
Sticker
```

Controls:

```text
Move
Resize
Rotate
Opacity
Delete
```

---

# 32. Photo Editor

Editor menggunakan model layer-based.

```text
Canvas
│
├── Background
├── Photo 1
├── Photo 2
├── Photo 3
├── Photo 4
├── Text
├── Logo
├── Decoration
└── Frame Overlay
```

---

# 33. Editor Controls

Toolbar:

```text
Undo
Redo
Crop
Rotate
Flip
Filter
Adjust
Add Text
Add Image
Add Sticker
Delete
```

---

# 34. Photo Adjustments

Per photo:

```text
Brightness
Contrast
Saturation
Exposure
Blur
Sharpness
Opacity
```

---

# 35. Filters

Default filters:

```text
Original
Vintage
Warm
Cool
Mono
Noir
Fade
Retro
```

Filter harus diproses client-side.

---

# 36. Crop

Preset:

```text
Free
1:1
4:5
3:4
4:3
16:9
9:16
```

---

# 37. Transform

Setiap layer:

```text
X
Y
Scale
Rotation
Opacity
```

---

# 38. Undo / Redo

Editor harus memiliki history.

Target:

```text
20 – 50 states
```

History tidak boleh menyebabkan memory leak.

State besar seperti raw image data sebaiknya tidak diduplikasi secara berlebihan.

---

# 39. Zoom

Editor canvas:

```text
25%
50%
75%
100%
150%
200%
Fit
```

Controls:

```text
+
-
Reset
Fit Canvas
```

---

# 40. Layer Panel

Desktop editor menyediakan:

```text
LAYERS

👁 Background
👁 Photo 1
👁 Photo 2
👁 Text
👁 Logo
👁 Decoration
```

User dapat:

* Hide
* Show
* Select
* Move up
* Move down
* Delete

---

# 41. Final Rendering

Editor menggunakan interactive rendering.

Final export menggunakan high-resolution rendering.

```text
Interactive Canvas
       ↓
Editor State
       ↓
Render Engine
       ↓
High Resolution Canvas
       ↓
Blob
       ↓
Download
```

---

# 42. Rendering Engine

Gunakan:

### Konva.js

Untuk interactive editor.

### Native Canvas API

Untuk final export.

Alasannya:

Konva menangani interaction, sedangkan Canvas API memberikan kontrol penuh terhadap hasil final.

---

# 43. Export Formats

### JPG

Default untuk foto.

### PNG

Untuk kualitas dan transparency.

### WebP

Optional untuk ukuran file lebih kecil.

---

# 44. Export Settings

```text
Format
Quality
Width
Height
```

Quality:

```text
Low
Medium
High
Maximum
```

Default:

```text
JPG
High
```

---

# 45. Export Naming

Format:

```text
photo-booth-YYYY-MM-DD-HHmmss.ext
```

Contoh:

```text
photo-booth-2026-08-12-194530.jpg
```

---

# 46. Result Screen

```text
YOUR PHOTO IS READY

┌────────────────────┐
│                    │
│    FINAL PHOTO     │
│                    │
└────────────────────┘

[ DOWNLOAD JPG ]

[ DOWNLOAD PNG ]

[ EDIT AGAIN ]

[ NEW SESSION ]
```

Privacy indicator:

```text
🔒 Processed locally
```

---

# 47. Local Storage Architecture

Storage dibagi menjadi:

```text
localStorage
│
└── Preferences

IndexedDB
│
├── Custom Frames
├── Favorites
└── Optional Temporary Session

Memory
│
└── Captured Photos
```

Foto hasil capture sebisa mungkin tetap berada di memory/session Blob.

---

# 48. Session Lifecycle

```text
CREATE SESSION
      ↓
CAPTURE
      ↓
EDIT
      ↓
RENDER
      ↓
EXPORT
      ↓
SESSION COMPLETE
      ↓
CLEANUP
```

Cleanup:

```text
Captured photo references
Object URLs
Canvas references
Temporary blobs
Editor state
```

harus dibersihkan.

---

# 49. Custom Frame Builder

Fitur advanced.

User dapat:

```text
CREATE FRAME
 ↓
CANVAS SIZE
 ↓
ADD PHOTO SLOT
 ↓
MOVE
 ↓
RESIZE
 ↓
ADD TEXT
 ↓
ADD IMAGE
 ↓
ADD DECORATION
 ↓
SAVE
```

Frame disimpan ke IndexedDB.

---

# 50. Frame Favorites

User dapat:

```text
♡ Favorite
♥ Favorited
```

Favorites disimpan lokal.

---

# 51. PWA

Aplikasi harus dapat di-install sebagai PWA.

Manifest:

```text
name
short_name
icons
theme_color
background_color
display: standalone
```

---

# 52. Offline Architecture

```text
             FIRST VISIT
                  │
                  ▼
             Web Server
                  │
                  ▼
             Application
                  │
                  ▼
            Service Worker
                  │
                  ▼
               Cache
                  │
                  ▼
            LOCAL DEVICE
                  │
          ┌───────┴───────┐
          ▼               ▼
       Camera           Editor
          │               │
          └───────┬───────┘
                  ▼
               Export
```

Setelah application shell tersedia, photo workflow tidak membutuhkan internet.

---

# 53. Technology Stack

## Frontend

```text
React
TypeScript
Vite
```

## UI

```text
Tailwind CSS
shadcn/ui
Lucide React
Motion
```

## State

```text
Zustand
```

## Camera

```text
MediaDevices API
getUserMedia()
```

## Editor

```text
Konva.js
react-konva
```

## Rendering

```text
Canvas API
OffscreenCanvas
Blob
URL.createObjectURL
```

## Storage

```text
localStorage
IndexedDB
```

## Offline

```text
Service Worker
PWA
```

---

# 54. System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│                                                          │
│ React                                                     │
│ ├── Home                                                  │
│ ├── Camera                                                │
│ ├── Review                                                │
│ ├── Editor                                                │
│ ├── Result                                                │
│ └── Settings                                              │
│                                                          │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                      │
│                                                          │
│ Zustand                                                   │
│ ├── Camera Store                                          │
│ ├── Session Store                                         │
│ ├── Editor Store                                          │
│ ├── Settings Store                                        │
│ └── Frame Store                                           │
│                                                          │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│                                                          │
│ Camera Controller                                         │
│ Capture Manager                                           │
│ Frame Manager                                             │
│ Editor Manager                                            │
│ Render Manager                                            │
│ Export Manager                                            │
│ Session Manager                                           │
│ Storage Manager                                           │
│                                                          │
└───────────────┬──────────────────┬─────────────────────────┘
                │                  │
                ▼                  ▼
┌────────────────────────┐  ┌──────────────────────────────┐
│   BROWSER APIS         │  │       LOCAL STORAGE          │
│                        │  │                              │
│ MediaDevices           │  │ localStorage                 │
│ Canvas                 │  │ IndexedDB                    │
│ Blob                   │  │ Cache API                    │
│ File API               │  │ Service Worker               │
└────────────────────────┘  └──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│                     LOCAL DEVICE                         │
│                                                          │
│ Camera → Memory → Canvas → Final Image → Download       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

# 55. Component Architecture

```text
src/
│
├── app/
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── Home/
│   ├── Booth/
│   ├── Review/
│   ├── Editor/
│   ├── Result/
│   ├── Settings/
│   └── Privacy/
│
├── components/
│   ├── camera/
│   ├── capture/
│   ├── frame/
│   ├── editor/
│   ├── layers/
│   ├── export/
│   ├── settings/
│   └── common/
│
├── features/
│   ├── camera/
│   ├── session/
│   ├── frames/
│   ├── editor/
│   ├── renderer/
│   ├── export/
│   └── storage/
│
├── stores/
│   ├── cameraStore.ts
│   ├── sessionStore.ts
│   ├── editorStore.ts
│   ├── frameStore.ts
│   └── settingsStore.ts
│
├── lib/
│   ├── camera/
│   ├── canvas/
│   ├── renderer/
│   ├── image/
│   ├── storage/
│   └── utils/
│
├── data/
│   ├── frames/
│   ├── layouts/
│   ├── filters/
│   └── stickers/
│
├── types/
│   ├── camera.ts
│   ├── photo.ts
│   ├── frame.ts
│   ├── editor.ts
│   └── export.ts
│
└── assets/
    ├── fonts/
    ├── icons/
    └── stickers/
```

---

# 56. Core Data Model

## Photo

```text
Photo
├── id
├── blob
├── width
├── height
├── capturedAt
├── adjustments
└── crop
```

## Frame

```text
Frame
├── id
├── name
├── category
├── canvas
├── background
├── slots
└── layers
```

## Photo Slot

```text
PhotoSlot
├── id
├── x
├── y
├── width
├── height
├── rotation
├── radius
├── objectFit
└── photoId
```

## Layer

```text
Layer
├── id
├── type
├── x
├── y
├── width
├── height
├── rotation
├── opacity
└── visible
```

---

# 57. Camera Architecture

```text
CameraManager
│
├── enumerateDevices()
├── requestPermission()
├── startCamera()
├── stopCamera()
├── switchCamera()
├── setResolution()
└── getCapabilities()
```

Flow:

```text
enumerateDevices
      ↓
User selects camera
      ↓
getUserMedia
      ↓
MediaStream
      ↓
Video Element
      ↓
Capture Frame
      ↓
Canvas
```

---

# 58. Capture Architecture

```text
CaptureManager
│
├── prepareCapture()
├── startCountdown()
├── capturePhoto()
├── savePhoto()
├── retakePhoto()
└── completeSession()
```

Capture harus mengambil frame dari video element menggunakan Canvas.

---

# 59. Editor Architecture

```text
Editor
│
├── Canvas Stage
│
├── Layer Manager
│
├── Selection Manager
│
├── Transform Manager
│
├── History Manager
│
└── Toolbar
```

Konva digunakan sebagai interactive canvas.

---

# 60. Renderer Architecture

Renderer harus terpisah dari UI editor.

```text
Editor State
      ↓
Render Configuration
      ↓
Renderer
      ↓
Canvas
      ↓
Blob
      ↓
Export
```

Dengan demikian final rendering tidak bergantung pada ukuran preview editor.

---

# 61. High Resolution Rendering

Misalnya canvas editor:

```text
600 × 900
```

Tetapi output:

```text
1200 × 1800
```

Renderer harus melakukan scaling berdasarkan output resolution.

Hal ini memungkinkan editor tetap ringan tetapi output tetap berkualitas tinggi.

---

# 62. Performance Strategy

Untuk mencegah browser lag:

* Jangan menyimpan image base64 besar di Zustand.
* Gunakan Blob/Object URL.
* Gunakan thumbnails untuk preview.
* Gunakan high-resolution rendering hanya saat export.
* Batasi history editor.
* Gunakan debounce untuk expensive operations.
* Gunakan OffscreenCanvas jika tersedia.
* Cleanup Object URLs.
* Hindari duplicate image buffers.

---

# 63. Memory Protection

Custom output maksimal:

```text
6000 × 6000 px
```

Tetapi aplikasi harus menghitung estimated memory sebelum rendering.

Jika terlalu besar:

```text
Large Export

This resolution may require significant
memory on your device.

[ Reduce Resolution ]
[ Continue ]
```

---

# 64. Error Handling

Kategori error:

```text
Camera Error
Permission Error
Unsupported Browser
Memory Error
Rendering Error
Export Error
Storage Error
```

Setiap error harus memiliki:

* Human-readable message
* Recovery action
* Retry button jika relevan

---

# 65. Security Architecture

Gunakan HTTPS production.

Security headers:

```text
Content-Security-Policy
Permissions-Policy
Referrer-Policy
X-Content-Type-Options
```

Permissions Policy dapat membatasi penggunaan kamera.

Tidak ada endpoint upload foto pada arsitektur default.

---

# 66. Analytics Policy

Default:

**No analytics.**

Jika suatu saat analytics ditambahkan, analytics hanya boleh mengumpulkan data teknis non-photo dan harus mendapatkan persetujuan jika diperlukan.

Tidak boleh mengirim:

* Foto
* Thumbnail
* Face data
* Image metadata yang sensitif

---

# 67. Deployment Architecture

Karena tidak ada backend:

```text
GitHub
   ↓
Build
   ↓
Static Hosting
   ↓
CDN
   ↓
Browser
```

Hosting yang cocok:

* Cloudflare Pages
* Vercel
* Netlify
* GitHub Pages

Untuk kebutuhan personal, static hosting sudah cukup.

---

# 68. Production Architecture

```text
                    INTERNET
                       │
                       ▼
               ┌──────────────┐
               │ Static Host  │
               │              │
               │ HTML         │
               │ JS           │
               │ CSS          │
               │ Assets       │
               └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │   Browser    │
               │              │
               │ React        │
               │ Camera       │
               │ Editor       │
               │ Renderer     │
               │ Storage      │
               └──────┬───────┘
                      │
              ┌───────┴────────┐
              ▼                ▼
           Webcam           Local Disk
                              │
                              ▼
                           Download
```

Server hanya berfungsi sebagai static asset delivery.

---

# 69. Development Phases

## Phase 1 — Foundation

* React
* TypeScript
* Vite
* Tailwind
* Routing
* Base layout
* Theme
* Project architecture

## Phase 2 — Camera

* Camera permission
* Device enumeration
* Camera selection
* Preview
* Resolution
* Mirror
* Start/stop camera

## Phase 3 — Capture

* Countdown
* Capture
* Multiple photos
* Shutter
* Flash
* Retake

## Phase 4 — Frame Engine

* Frame JSON schema
* Frame library
* Layout system
* Photo slots
* Aspect ratio
* Canvas size

## Phase 5 — Editor

* Konva
* Drag
* Resize
* Rotate
* Layer system
* Text
* Image
* Decoration
* Crop
* Filters
* Adjustments

## Phase 6 — History

* Undo
* Redo
* History management

## Phase 7 — Renderer

* High-resolution renderer
* JPG
* PNG
* WebP
* Quality control

## Phase 8 — Custom Frames

* Frame builder
* Save frame
* Edit frame
* Delete frame
* Favorites

## Phase 9 — Privacy

* Privacy page
* Camera lifecycle
* Session cleanup
* Storage isolation
* Security headers

## Phase 10 — PWA

* Service worker
* Manifest
* Offline cache
* Install prompt
* Offline workflow

## Phase 11 — Kiosk

* Fullscreen
* Auto reset
* Touch optimization
* Idle timeout
* Keyboard protection

## Phase 12 — Polish

* Animation
* Loading states
* Error handling
* Performance optimization
* Responsive design
* Accessibility
* Production testing

---

# 70. MVP Definition

MVP minimal:

```text
Home
 ↓
Camera
 ↓
Capture
 ↓
Review
 ↓
Frame
 ↓
Basic Editor
 ↓
Render
 ↓
Download
```

MVP harus sudah:

* Menggunakan webcam.
* Capture multiple photos.
* Retake.
* Memilih frame.
* Mengatur frame size.
* Mengatur layout.
* Menghasilkan JPG/PNG.
* Tidak mengupload foto.

---

# 71. Acceptance Criteria

## Camera

* [ ] Camera permission dapat diminta.
* [ ] Camera dapat dipilih.
* [ ] Camera preview tampil.
* [ ] Camera dapat dihentikan.
* [ ] Mirror berfungsi.

## Capture

* [ ] Countdown berfungsi.
* [ ] Foto dapat diambil.
* [ ] Multiple capture berfungsi.
* [ ] Retake berfungsi.
* [ ] Shutter effect berfungsi.

## Frame

* [ ] Frame library tampil.
* [ ] Frame dapat dipilih.
* [ ] Frame memiliki ukuran berbeda.
* [ ] Layout dapat digunakan.
* [ ] Photo slot bekerja.

## Editor

* [ ] Photo dapat dipindahkan.
* [ ] Photo dapat di-resize.
* [ ] Photo dapat di-rotate.
* [ ] Text dapat ditambahkan.
* [ ] Image/logo dapat ditambahkan.
* [ ] Decoration dapat ditambahkan.
* [ ] Undo/redo berfungsi.

## Export

* [ ] JPG berfungsi.
* [ ] PNG berfungsi.
* [ ] Quality dapat diubah.
* [ ] Resolution dapat diubah.
* [ ] File dapat di-download.

## Privacy

* [ ] Foto tidak di-upload.
* [ ] Tidak ada database foto.
* [ ] Camera dihentikan setelah selesai.
* [ ] Temporary session dibersihkan.
* [ ] Privacy information tersedia.

## PWA

* [ ] Application dapat di-install.
* [ ] Application shell dapat digunakan offline.
* [ ] Assets tercache.
* [ ] Photo workflow dapat bekerja offline setelah initial load.

---

# 72. Definition of Done

Project dinyatakan selesai apabila:

1. User dapat membuka aplikasi melalui browser.
2. User dapat mengakses webcam.
3. User dapat memilih kamera.
4. User dapat mengatur mirror dan resolution.
5. User dapat menentukan jumlah foto.
6. User dapat menggunakan countdown.
7. User dapat mengambil foto.
8. User dapat melakukan retake.
9. User dapat memilih frame.
10. User dapat memilih layout.
11. User dapat mengatur canvas size.
12. User dapat mengedit foto.
13. User dapat menambahkan text.
14. User dapat menambahkan logo.
15. User dapat menambahkan decoration.
16. User dapat menggunakan undo/redo.
17. User dapat menghasilkan high-resolution final image.
18. User dapat download JPG/PNG.
19. Foto tidak dikirim ke server.
20. Session dapat dibersihkan.
21. Aplikasi dapat digunakan sebagai PWA.
22. Aplikasi dapat berjalan tanpa backend.

---

# 73. Final Technology Decision

Stack final yang digunakan:

```text
┌────────────────────────────────────────┐
│              FRONTEND                  │
├────────────────────────────────────────┤
│ React                                  │
│ TypeScript                             │
│ Vite                                   │
│ Tailwind CSS                           │
│ shadcn/ui                              │
│ Lucide React                           │
│ Motion                                 │
├────────────────────────────────────────┤
│              PHOTO                    │
├────────────────────────────────────────┤
│ MediaDevices API                       │
│ Canvas API                             │
│ Konva.js                               │
│ react-konva                            │
├────────────────────────────────────────┤
│              STATE                    │
├────────────────────────────────────────┤
│ Zustand                                │
├────────────────────────────────────────┤
│              STORAGE                  │
├────────────────────────────────────────┤
│ IndexedDB                              │
│ localStorage                           │
├────────────────────────────────────────┤
│              OFFLINE                  │
├────────────────────────────────────────┤
│ PWA                                    │
│ Service Worker                         │
│ Cache API                              │
├────────────────────────────────────────┤
│              BACKEND                  │
├────────────────────────────────────────┤
│ None for MVP                           │
└────────────────────────────────────────┘
```

---

# 74. Core Architectural Principle

Seluruh aplikasi harus dibangun dengan satu prinsip:

```text
                  SERVER
                    │
             Static Assets Only
                    │
                    ▼
             ┌─────────────┐
             │   BROWSER   │
             │             │
Camera ─────►│ Capture     │
             │             │
             │ Editor      │
             │             │
             │ Renderer    │
             │             │
             │ Export      │
             └──────┬──────┘
                    │
                    ▼
                DOWNLOAD
```

**Server tidak mengetahui foto apa yang diambil pengguna.**

Ini membuat aplikasi lebih sederhana dari sisi infrastructure sekaligus memberikan privacy yang kuat.

---

# 75. Product End State

Pengalaman akhir yang ditargetkan:

```text
┌───────────────────────────────────────────┐
│                                           │
│           PERSONAL PHOTO BOOTH            │
│                                           │
│          Create your moment.              │
│                                           │
│              [ START ]                    │
│                                           │
│          🔒 Privacy-first                 │
│                                           │
└───────────────────────────────────────────┘

                    ↓

┌───────────────────────────────────────────┐
│                 CAMERA                    │
│                                           │
│            ┌─────────────┐                │
│            │             │                │
│            │   CAMERA    │                │
│            │   PREVIEW   │                │
│            │             │                │
│            └─────────────┘                │
│                                           │
│                  3                        │
│                                           │
│     Photo 1 / 4                          │
│                                           │
└───────────────────────────────────────────┘

                    ↓

┌───────────────────────────────────────────┐
│                  EDIT                     │
│                                           │
│   ┌─────────────────┐   ┌─────────────┐  │
│   │                 │   │ Frames      │  │
│   │                 │   │             │  │
│   │   FINAL PHOTO   │   │ Classic     │  │
│   │                 │   │ Film        │  │
│   │                 │   │ Vintage     │  │
│   │                 │   │ Minimal     │  │
│   │                 │   │ Custom      │  │
│   └─────────────────┘   └─────────────┘  │
│                                           │
│  Undo  Redo  Text  Image  Filter  Crop   │
│                                           │
└───────────────────────────────────────────┘

                    ↓

┌───────────────────────────────────────────┐
│                RESULT                     │
│                                           │
│          YOUR PHOTO IS READY              │
│                                           │
│           ┌─────────────┐                 │
│           │             │                 │
│           │ FINAL PHOTO │                 │
│           │             │                 │
│           └─────────────┘                 │
│                                           │
│       [ DOWNLOAD JPG ]                    │
│       [ DOWNLOAD PNG ]                    │
│                                           │
│       [ EDIT AGAIN ]                      │
│       [ NEW SESSION ]                     │
│                                           │
│          🔒 Processed locally             │
└───────────────────────────────────────────┘
```

**Kesimpulan arsitektur:** untuk project ini saya tidak menyarankan membangun backend terlebih dahulu. Bangun sebagai **React + TypeScript + Vite PWA dengan MediaDevices + Konva + Canvas + Zustand + IndexedDB**, lalu seluruh capture, editing, rendering, dan export dilakukan di browser. Ini paling sesuai dengan requirement **personal, web-based, customizable, dan privacy-first**.
