-- AlterTable
ALTER TABLE `site_settings` ADD COLUMN `aboutBackgroundPath` VARCHAR(255) NULL,
    ADD COLUMN `contactBackgroundPath` VARCHAR(255) NULL,
    ADD COLUMN `ctaBackgroundPath` VARCHAR(255) NULL,
    ADD COLUMN `requestBackgroundPath` VARCHAR(255) NULL;
