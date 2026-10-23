-- CreateTable: Store per-page SEO planning data without changing existing content records
CREATE TABLE `seo_page_settings` (
    `id` VARCHAR(191) NOT NULL,
    `pageKey` VARCHAR(255) NOT NULL,
    `pageType` VARCHAR(30) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` VARCHAR(400) NULL,
    `primaryKeyword` VARCHAR(160) NULL,
    `secondaryKeywords` JSON NULL,
    `localKeywords` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seo_page_settings_pageKey_key`(`pageKey`),
    INDEX `seo_page_settings_pageType_entityId_idx`(`pageType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
