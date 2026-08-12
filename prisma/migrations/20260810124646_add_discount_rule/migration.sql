-- CreateTable
CREATE TABLE "DiscountRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "threshold" REAL NOT NULL DEFAULT 500,
    "percentOff" REAL NOT NULL DEFAULT 10,
    "giftThreshold" REAL NOT NULL DEFAULT 750,
    "giftVariantIds" TEXT NOT NULL DEFAULT '[]',
    "b2bMinOrder" REAL NOT NULL DEFAULT 200,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountRule_shop_key" ON "DiscountRule"("shop");
