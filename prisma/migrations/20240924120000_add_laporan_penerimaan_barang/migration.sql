CREATE TABLE "laporan_penerimaan_barang" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT,
    "tanggal_po" TIMESTAMP(3),
    "customer_id" TEXT,
    "alamat_customer" TEXT,
    "termin_bayar" TEXT,
    "status_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "laporan_penerimaan_barang_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "laporan_penerimaan_barang"
    ADD CONSTRAINT "laporan_penerimaan_barang_purchase_order_id_fkey"
    FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "laporan_penerimaan_barang"
    ADD CONSTRAINT "laporan_penerimaan_barang_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "laporan_penerimaan_barang"
    ADD CONSTRAINT "laporan_penerimaan_barang_termin_bayar_fkey"
    FOREIGN KEY ("termin_bayar") REFERENCES "term_of_payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "laporan_penerimaan_barang"
    ADD CONSTRAINT "laporan_penerimaan_barang_status_id_fkey"
    FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "file_uploaded"
    ADD COLUMN "laporan_penerimaan_barang_id" TEXT;

ALTER TABLE "file_uploaded"
    ADD CONSTRAINT "file_uploaded_laporan_penerimaan_barang_id_fkey"
    FOREIGN KEY ("laporan_penerimaan_barang_id") REFERENCES "laporan_penerimaan_barang" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
