-- Safe non-destructive migration for Service Options and Request Item Option Snapshots

-- CreateTable service_options
CREATE TABLE `service_options` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `description` VARCHAR(300) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `service_options_serviceId_isActive_sortOrder_idx`(`serviceId`, `isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey for service_options
ALTER TABLE `service_options` ADD CONSTRAINT `service_options_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable service_request_items: add optionId and optionName
ALTER TABLE `service_request_items`
    ADD COLUMN `optionId` VARCHAR(191) NULL,
    ADD COLUMN `optionName` VARCHAR(180) NULL;

-- CreateIndex
CREATE INDEX `service_request_items_optionId_idx` ON `service_request_items`(`optionId`);

-- AddForeignKey for service_request_items option
ALTER TABLE `service_request_items` ADD CONSTRAINT `service_request_items_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `service_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
