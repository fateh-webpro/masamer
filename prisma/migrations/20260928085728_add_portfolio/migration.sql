-- CreateTable
CREATE TABLE `portfolio_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` VARCHAR(300) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portfolio_categories_slug_key`(`slug`),
    INDEX `portfolio_categories_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_items` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `shortDescription` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `coverImagePath` VARCHAR(255) NOT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portfolio_items_slug_key`(`slug`),
    INDEX `portfolio_items_categoryId_isActive_sortOrder_idx`(`categoryId`, `isActive`, `sortOrder`),
    INDEX `portfolio_items_isFeatured_isActive_idx`(`isFeatured`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_images` (
    `id` VARCHAR(191) NOT NULL,
    `portfolioItemId` VARCHAR(191) NOT NULL,
    `imagePath` VARCHAR(255) NOT NULL,
    `altText` VARCHAR(200) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `portfolio_images_portfolioItemId_sortOrder_idx`(`portfolioItemId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `portfolio_items` ADD CONSTRAINT `portfolio_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `portfolio_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_images` ADD CONSTRAINT `portfolio_images_portfolioItemId_fkey` FOREIGN KEY (`portfolioItemId`) REFERENCES `portfolio_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
