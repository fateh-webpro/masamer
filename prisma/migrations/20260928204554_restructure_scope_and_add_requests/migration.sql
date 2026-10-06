/*
  Warnings:

  - You are about to drop the `rental_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rental_item_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rental_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `rental_item_images` DROP FOREIGN KEY `rental_item_images_rentalItemId_fkey`;

-- DropForeignKey
ALTER TABLE `rental_items` DROP FOREIGN KEY `rental_items_categoryId_fkey`;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `coverImagePath` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `rental_categories`;

-- DropTable
DROP TABLE `rental_item_images`;

-- DropTable
DROP TABLE `rental_items`;

-- CreateTable
CREATE TABLE `service_images` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `imagePath` VARCHAR(255) NOT NULL,
    `altText` VARCHAR(200) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_images_serviceId_sortOrder_idx`(`serviceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_requests` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `eventDate` DATE NULL,
    `city` VARCHAR(100) NOT NULL,
    `location` VARCHAR(255) NULL,
    `guestCount` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'new',
    `adminNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_requests_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `service_requests_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_images` ADD CONSTRAINT `service_images_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
