DROP INDEX `MediaFile_hash_key` ON `MediaFile`;

CREATE INDEX `MediaFile_hash_idx` ON `MediaFile`(`hash`);
