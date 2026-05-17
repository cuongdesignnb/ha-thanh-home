CREATE TABLE `ConstructionEstimatorConfig` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  `minFactor` DOUBLE NOT NULL DEFAULT 0.92,
  `maxFactor` DOUBLE NOT NULL DEFAULT 1.12,
  `inputSchemaJson` JSON NOT NULL,
  `formulaItemsJson` JSON NOT NULL,
  `disclaimer` TEXT NULL,
  `ctaTitle` VARCHAR(191) NULL,
  `ctaDescription` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ConstructionEstimatorConfig_isActive_idx` (`isActive`),
  INDEX `ConstructionEstimatorConfig_updatedAt_idx` (`updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ConstructionEstimate` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `configId` INTEGER NULL,
  `configName` VARCHAR(191) NULL,
  `inputJson` JSON NOT NULL,
  `variablesJson` JSON NOT NULL,
  `lineItemsJson` JSON NOT NULL,
  `total` INTEGER NOT NULL,
  `totalMin` INTEGER NOT NULL,
  `totalMax` INTEGER NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  `sourceUrl` VARCHAR(191) NULL,
  `leadId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ConstructionEstimate_leadId_idx` (`leadId`),
  INDEX `ConstructionEstimate_createdAt_idx` (`createdAt`),
  CONSTRAINT `ConstructionEstimate_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
