-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "kode_barang" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "stok_barang" INTEGER NOT NULL,
    "harga_barang" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventories_kode_barang_key" ON "inventories"("kode_barang");

