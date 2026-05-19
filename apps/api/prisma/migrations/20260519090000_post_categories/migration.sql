-- Add post categories and link posts to a managed category.
CREATE TABLE `PostCategory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `PostCategory_slug_key`(`slug`),
  INDEX `PostCategory_isActive_idx`(`isActive`),
  INDEX `PostCategory_sortOrder_idx`(`sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Post` ADD COLUMN `categoryId` INTEGER NULL;
CREATE INDEX `Post_categoryId_idx` ON `Post`(`categoryId`);
ALTER TABLE `Post` ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `PostCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
