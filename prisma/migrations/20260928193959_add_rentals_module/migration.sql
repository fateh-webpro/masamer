-- CreateTable
CREATE TABLE `rental_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` VARCHAR(300) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rental_categories_slug_key`(`slug`),
    INDEX `rental_categories_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rental_items` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `shortDescription` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `coverImagePath` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NULL,
    `priceType` VARCHAR(30) NOT NULL DEFAULT 'per_day',
    `showPrice` BOOLEAN NOT NULL DEFAULT false,
    `availabilityStatus` VARCHAR(30) NOT NULL DEFAULT 'available',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rental_items_slug_key`(`slug`),
    INDEX `rental_items_categoryId_isActive_sortOrder_idx`(`categoryId`, `isActive`, `sortOrder`),
    INDEX `rental_items_isFeatured_isActive_idx`(`isFeatured`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rental_item_images` (
    `id` VARCHAR(191) NOT NULL,
    `rentalItemId` VARCHAR(191) NOT NULL,
    `imagePath` VARCHAR(255) NOT NULL,
    `altText` VARCHAR(200) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rental_item_images_rentalItemId_sortOrder_idx`(`rentalItemId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rental_items` ADD CONSTRAINT `rental_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `rental_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rental_item_images` ADD CONSTRAINT `rental_item_images_rentalItemId_fkey` FOREIGN KEY (`rentalItemId`) REFERENCES `rental_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
