ALTER TABLE `Project` ADD COLUMN `thumbnailMediaId` INTEGER NULL;
ALTER TABLE `Service` ADD COLUMN `thumbnailMediaId` INTEGER NULL;
ALTER TABLE `Post` ADD COLUMN `thumbnailMediaId` INTEGER NULL;

CREATE INDEX `Project_thumbnailMediaId_idx` ON `Project`(`thumbnailMediaId`);
CREATE INDEX `Service_thumbnailMediaId_idx` ON `Service`(`thumbnailMediaId`);
CREATE INDEX `Post_thumbnailMediaId_idx` ON `Post`(`thumbnailMediaId`);

ALTER TABLE `Project`
  ADD CONSTRAINT `Project_thumbnailMediaId_fkey`
  FOREIGN KEY (`thumbnailMediaId`) REFERENCES `MediaFile`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Service`
  ADD CONSTRAINT `Service_thumbnailMediaId_fkey`
  FOREIGN KEY (`thumbnailMediaId`) REFERENCES `MediaFile`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Post`
  ADD CONSTRAINT `Post_thumbnailMediaId_fkey`
  FOREIGN KEY (`thumbnailMediaId`) REFERENCES `MediaFile`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
