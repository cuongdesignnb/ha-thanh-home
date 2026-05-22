SELECT id, LEFT(title, 50) AS title, icon, status, CHAR_LENGTH(contentHtml) AS content_len, updatedAt
FROM Service ORDER BY updatedAt DESC LIMIT 8;
SELECT id, LEFT(title, 50) AS title, status, CHAR_LENGTH(contentHtml) AS content_len, updatedAt
FROM ArchitectureDesignTemplate ORDER BY updatedAt DESC LIMIT 5;
