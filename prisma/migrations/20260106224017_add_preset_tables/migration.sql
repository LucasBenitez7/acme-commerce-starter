-- CreateTable
CREATE TABLE "PresetSize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'clothing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresetSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetColor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresetColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresetSize_name_key" ON "PresetSize"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PresetColor_name_hex_key" ON "PresetColor"("name", "hex");
