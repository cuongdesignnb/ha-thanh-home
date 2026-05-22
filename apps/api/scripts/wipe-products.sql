DELETE FROM Service WHERE thumbnailMediaId IN (SELECT id FROM MediaFile WHERE originalUrl LIKE 'https://hathanhhome.vn%') OR id >= 5;
DELETE FROM ArchitectureDesignTemplate WHERE thumbnailMediaId IN (SELECT id FROM MediaFile WHERE originalUrl LIKE 'https://hathanhhome.vn%') OR id >= 5;
SELECT 'Service' t, COUNT(*) n FROM Service UNION SELECT 'ArchTemplate', COUNT(*) FROM ArchitectureDesignTemplate;
