-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "nameSq" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "introSq" TEXT,
    "introEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "nameSq" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HadithBook" (
    "id" TEXT NOT NULL,
    "titleSq" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionSq" TEXT,
    "descriptionEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HadithBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HadithChapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "titleSq" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HadithChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "categoryId" TEXT,
    "bookId" TEXT,
    "chapterId" TEXT,
    "titleSq" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "contentSq" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "arabicText" TEXT,
    "hadithNumber" TEXT,
    "source" TEXT,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryRevision" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "titleSq" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "contentSq" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "arabicText" TEXT,
    "source" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntryRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE INDEX "Section_slug_idx" ON "Section"("slug");

-- CreateIndex
CREATE INDEX "Category_sectionId_idx" ON "Category"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_sectionId_slug_key" ON "Category"("sectionId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "HadithBook_slug_key" ON "HadithBook"("slug");

-- CreateIndex
CREATE INDEX "HadithChapter_bookId_order_idx" ON "HadithChapter"("bookId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "HadithChapter_bookId_slug_key" ON "HadithChapter"("bookId", "slug");

-- CreateIndex
CREATE INDEX "Entry_sectionId_idx" ON "Entry"("sectionId");

-- CreateIndex
CREATE INDEX "Entry_categoryId_idx" ON "Entry"("categoryId");

-- CreateIndex
CREATE INDEX "Entry_bookId_idx" ON "Entry"("bookId");

-- CreateIndex
CREATE INDEX "Entry_chapterId_idx" ON "Entry"("chapterId");

-- CreateIndex
CREATE INDEX "Entry_titleSq_idx" ON "Entry"("titleSq");

-- CreateIndex
CREATE INDEX "Entry_titleEn_idx" ON "Entry"("titleEn");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_bookId_hadithNumber_key" ON "Entry"("bookId", "hadithNumber");

-- CreateIndex
CREATE INDEX "EntryRevision_entryId_idx" ON "EntryRevision"("entryId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HadithChapter" ADD CONSTRAINT "HadithChapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "HadithBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "HadithBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "HadithChapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryRevision" ADD CONSTRAINT "EntryRevision_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
