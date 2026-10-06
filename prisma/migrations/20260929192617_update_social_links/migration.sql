/*
  Warnings:

  - You are about to drop the column `tiktokUrl` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `site_settings` DROP COLUMN `tiktokUrl`,
    ADD COLUMN `facebookUrl` VARCHAR(255) NULL;
