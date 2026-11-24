# Aturan kerja repo MockupDemo

## Git
- Setiap update langsung di-commit dan di-push ke branch `main` (tidak perlu branch fitur atau pull request).
- Sebelum push, cek `git diff --stat` dan pastikan hanya file yang diminta yang berubah.

## Folder yang dilindungi
- **Jangan mengubah apa pun di `Mockup_AYDA/`** kecuali pemilik repo memintanya secara eksplisit.
- Sebelum push, pastikan `git diff --stat -- Mockup_AYDA` kosong.

## Struktur
- `Kajima-Indonesia/`: mockup situs Kajima Indonesia (HTML/CSS statis, aset di `assets/`, dokumen proses di `docs/`).
- `Mockup_AYDA/`: proyek terpisah, lihat aturan di atas.
