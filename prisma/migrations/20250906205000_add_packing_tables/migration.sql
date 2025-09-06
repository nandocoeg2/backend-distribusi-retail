-- CreateTable
CREATE TABLE "packings" (
    "id" TEXT NOT NULL,
    "tanggal_packing" TIMESTAMP(3) NOT NULL,
    "statusId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "packings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_items" (
    "id" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "total_qty" INTEGER NOT NULL,
    "jumlah_carton" INTEGER NOT NULL,
    "isi_per_carton" INTEGER NOT NULL,
    "no_box" TEXT NOT NULL,
    "packingId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packing_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "packings_purchaseOrderId_key" ON "packings"("purchaseOrderId");

-- AddForeignKey
ALTER TABLE "packings" ADD CONSTRAINT "packings_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packings" ADD CONSTRAINT "packings_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "packings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
