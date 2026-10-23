-- AlterTable: Add optional SEO title and description to services
ALTER TABLE `services` ADD COLUMN `seoTitle` VARCHAR(200) NULL,
    ADD COLUMN `seoDescription` VARCHAR(400) NULL;
