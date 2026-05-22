SELECT 'Service total' AS info, COUNT(*) AS n FROM Service
UNION SELECT 'Service with gallery', COUNT(*) FROM Service WHERE galleryMediaIds IS NOT NULL AND JSON_LENGTH(galleryMediaIds) > 0
UNION SELECT 'ArchTemplate total', COUNT(*) FROM ArchitectureDesignTemplate
UNION SELECT 'ArchTemplate with gallery', COUNT(*) FROM ArchitectureDesignTemplate WHERE galleryMediaIds IS NOT NULL AND JSON_LENGTH(galleryMediaIds) > 0;
SELECT 'Top Services by gallery size' AS info, NULL AS x, NULL AS y;
SELECT id, LEFT(title, 50) AS title, JSON_LENGTH(galleryMediaIds) AS gallery_n FROM Service WHERE galleryMediaIds IS NOT NULL ORDER BY JSON_LENGTH(galleryMediaIds) DESC LIMIT 5;
SELECT 'Top ArchTemplates by gallery size' AS info, NULL, NULL;
SELECT id, LEFT(title, 50) AS title, JSON_LENGTH(galleryMediaIds) AS gallery_n FROM ArchitectureDesignTemplate WHERE galleryMediaIds IS NOT NULL ORDER BY JSON_LENGTH(galleryMediaIds) DESC LIMIT 5;
