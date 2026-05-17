CREATE TABLE `LeadNote` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `leadId` INTEGER NOT NULL,
  `note` TEXT NOT NULL,
  `createdBy` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `LeadNote_leadId_idx`(`leadId`),
  INDEX `LeadNote_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `LeadNote`
  ADD CONSTRAINT `LeadNote_leadId_fkey`
  FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `LeadNote`
  ADD CONSTRAINT `LeadNote_createdBy_fkey`
  FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
