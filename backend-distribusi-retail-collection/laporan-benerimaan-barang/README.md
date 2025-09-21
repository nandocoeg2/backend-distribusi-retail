# Laporan Benerimaan Barang API

Kumpulan request Bruno untuk modul Laporan Benerimaan Barang pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/laporan-benerimaan-barang
```

## Autentikasi
Seluruh endpoint membutuhkan header Authorization dengan Bearer Token yang valid. Nilai token dapat diatur melalui environment variable `access_token` pada workspace Bruno.

## Daftar Endpoint
1. **Create Laporan** – `POST /`
2. **Get All Laporan** – `GET /`
3. **Get Laporan By ID** – `GET /:id`
4. **Update Laporan** – `PUT /:id`
5. **Delete Laporan** – `DELETE /:id`
6. **Search Laporan** – `GET /search`

Setiap request contoh sudah dilengkapi dengan payload dan parameter dasar yang dapat disesuaikan sesuai kebutuhan pengujian.
