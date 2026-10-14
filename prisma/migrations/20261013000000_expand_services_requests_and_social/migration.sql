-- Safe non-destructive migration for Service Categories, Multi-Service Requests, and TikTok

-- AlterTable site_settings: add tiktokUrl
ALTER TABLE `site_settings` ADD COLUMN `tiktokUrl` VARCHAR(255) NULL;

-- CreateTable service_categories
CREATE TABLE `service_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` VARCHAR(300) NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT 'Coffee',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `service_categories_slug_key`(`slug`),
    INDEX `service_categories_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable services: add categoryId
ALTER TABLE `services` ADD COLUMN `categoryId` VARCHAR(191) NULL;
CREATE INDEX `services_categoryId_isActive_sortOrder_idx` ON `services`(`categoryId`, `isActive`, `sortOrder`);
ALTER TABLE `services` ADD CONSTRAINT `services_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `service_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable service_requests: make serviceId nullable, add district and customRequest
ALTER TABLE `service_requests`
    MODIFY `serviceId` VARCHAR(191) NULL,
    ADD COLUMN `district` VARCHAR(100) NULL,
    ADD COLUMN `customRequest` TEXT NULL;

-- CreateTable service_request_items
CREATE TABLE `service_request_items` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `serviceName` VARCHAR(180) NOT NULL,
    `categoryName` VARCHAR(120) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `notes` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_request_items_requestId_idx`(`requestId`),
    INDEX `service_request_items_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKeys
ALTER TABLE `service_request_items` ADD CONSTRAINT `service_request_items_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_request_items` ADD CONSTRAINT `service_request_items_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
