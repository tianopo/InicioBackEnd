-- CreateTable
CREATE TABLE "buyer" (
    "id" TEXT NOT NULL,
    "createdIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "document" TEXT NOT NULL,

    CONSTRAINT "buyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_id_key" ON "buyer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_document_key" ON "buyer"("document");
