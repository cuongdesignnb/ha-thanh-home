CREATE TABLE `ProjectCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group` ENUM('construction', 'interior') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProjectCategory_slug_key`(`slug`),
    INDEX `ProjectCategory_group_idx`(`group`),
    INDEX `ProjectCategory_isActive_idx`(`isActive`),
    INDEX `ProjectCategory_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProjectFilterOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group` ENUM('construction', 'interior') NOT NULL,
    `type` ENUM('project_type', 'style', 'scale', 'location', 'space', 'budget_range') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProjectFilterOption_slug_key`(`slug`),
    INDEX `ProjectFilterOption_group_idx`(`group`),
    INDEX `ProjectFilterOption_type_idx`(`type`),
    INDEX `ProjectFilterOption_isActive_idx`(`isActive`),
    INDEX `ProjectFilterOption_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Project`
    ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `projectType` VARCHAR(191) NULL,
    ADD COLUMN `areaValue` INTEGER NULL,
    ADD COLUMN `scale` VARCHAR(191) NULL,
    ADD COLUMN `clientName` VARCHAR(191) NULL,
    ADD COLUMN `budgetRange` VARCHAR(191) NULL,
    ADD COLUMN `galleryMediaIds` JSON NULL;

CREATE INDEX `Project_categoryId_idx` ON `Project`(`categoryId`);
CREATE INDEX `Project_projectType_idx` ON `Project`(`projectType`);
CREATE INDEX `Project_style_idx` ON `Project`(`style`);
CREATE INDEX `Project_scale_idx` ON `Project`(`scale`);
CREATE INDEX `Project_location_idx` ON `Project`(`location`);
CREATE INDEX `Project_areaValue_idx` ON `Project`(`areaValue`);

ALTER TABLE `Project` ADD CONSTRAINT `Project_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProjectCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
