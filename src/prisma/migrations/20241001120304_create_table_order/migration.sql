-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "createdIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroOrdem" TEXT NOT NULL,
    "dataTransacao" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "ativoDigital" TEXT NOT NULL,
    "quantidade" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "valorToken" TEXT NOT NULL,
    "taxaTransacao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "buyerId" TEXT,
    "sellerId" TEXT,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_id_key" ON "order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_numeroOrdem_key" ON "order"("numeroOrdem");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
