-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "sectionBookId" TEXT;

-- CreateTable
CREATE TABLE "SectionBook" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "titleSq" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionSq" TEXT,
    "descriptionEn" TEXT,
    "totalPages" INTEGER,
    "hasTafsir" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SectionBook_sectionId_idx" ON "SectionBook"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionBook_sectionId_slug_key" ON "SectionBook"("sectionId", "slug");

-- CreateIndex
CREATE INDEX "Entry_sectionBookId_idx" ON "Entry"("sectionBookId");

-- AddForeignKey
ALTER TABLE "SectionBook" ADD CONSTRAINT "SectionBook_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sectionBookId_fkey" FOREIGN KEY ("sectionBookId") REFERENCES "SectionBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
