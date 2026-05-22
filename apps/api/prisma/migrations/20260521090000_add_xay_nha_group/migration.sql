-- Add new enum value to ProjectGroup
ALTER TABLE `Project` MODIFY `group` ENUM('construction', 'interior', 'xay_nha_tron_goi') NOT NULL;
ALTER TABLE `ProjectCategory` MODIFY `group` ENUM('construction', 'interior', 'xay_nha_tron_goi') NOT NULL;
ALTER TABLE `ProjectFilterOption` MODIFY `group` ENUM('construction', 'interior', 'xay_nha_tron_goi') NOT NULL;
ALTER TABLE `Service` MODIFY `group` ENUM('construction', 'interior', 'xay_nha_tron_goi') NOT NULL;
