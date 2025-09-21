CREATE TABLE "laporan_benerimaan_barang" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT,
    "tanggal_po" TIMESTAMP(3),
    "customer_id" TEXT,
    "alamat_customer" TEXT,
    "termin_bayar" TEXT,
    "file_path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "laporan_benerimaan_barang_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "laporan_benerimaan_barang"
    ADD CONSTRAINT "laporan_benerimaan_barang_purchase_order_id_fkey"
    FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "laporan_benerimaan_barang"
    ADD CONSTRAINT "laporan_benerimaan_barang_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "laporan_benerimaan_barang"
    ADD CONSTRAINT "laporan_benerimaan_barang_termin_bayar_fkey"
    FOREIGN KEY ("termin_bayar") REFERENCES "term_of_payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
