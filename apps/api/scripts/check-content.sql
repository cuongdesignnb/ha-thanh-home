SELECT id, CHAR_LENGTH(contentHtml) AS len,
  LOCATE('http://localhost:31875/uploads/', contentHtml) AS abs_pos,
  LOCATE('hathanhhome.vn', contentHtml) AS legacy_url_pos
FROM Service WHERE id IN (184, 156);
SELECT id, CHAR_LENGTH(contentHtml) AS len,
  LOCATE('http://localhost:31875/uploads/', contentHtml) AS abs_pos,
  LOCATE('hathanhhome.vn', contentHtml) AS legacy_url_pos
FROM ArchitectureDesignTemplate ORDER BY id DESC LIMIT 3;
