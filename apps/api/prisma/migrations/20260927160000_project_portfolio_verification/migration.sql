ALTER TABLE `Project`
  ADD COLUMN `isPortfolioVerified` BOOLEAN NOT NULL DEFAULT false;

-- Preserve the current published-project presentation as a one-time legacy backfill.
-- New records use the schema default false and require an explicit Admin decision.
UPDATE `Project`
SET `isPortfolioVerified` = true
WHERE `status` = 'published';

-- This record is a local-service/informational page, not a verified HTH project case.
UPDATE `Project`
SET `isPortfolioVerified` = false
WHERE `id` = 65;
