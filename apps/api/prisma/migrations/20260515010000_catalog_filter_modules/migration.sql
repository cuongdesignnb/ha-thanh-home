ALTER TABLE `ProjectFilterOption`
  ADD COLUMN `module` ENUM('project', 'architecture_design', 'interior_design') NOT NULL DEFAULT 'project';

ALTER TABLE `ProjectFilterOption`
  MODIFY `type` ENUM(
    'project_type',
    'house_type',
    'interior_style',
    'style',
    'scale',
    'location',
    'space',
    'room_type',
    'roof_type',
    'floors',
    'layout_type',
    'material_tone',
    'budget_range'
  ) NOT NULL;

CREATE INDEX `ProjectFilterOption_module_idx` ON `ProjectFilterOption`(`module`);
