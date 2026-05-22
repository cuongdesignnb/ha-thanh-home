UPDATE MediaFile SET webpUrl   = CONCAT('http://localhost:31875', webpUrl)   WHERE webpUrl   LIKE '/uploads/%';
UPDATE MediaFile SET thumbUrl  = CONCAT('http://localhost:31875', thumbUrl)  WHERE thumbUrl  LIKE '/uploads/%';
UPDATE MediaFile SET mediumUrl = CONCAT('http://localhost:31875', mediumUrl) WHERE mediumUrl LIKE '/uploads/%';
UPDATE Post     SET contentHtml = REPLACE(contentHtml, 'src="/uploads/', 'src="http://localhost:31875/uploads/') WHERE contentHtml LIKE '%src="/uploads/%';
UPDATE Project  SET contentHtml = REPLACE(contentHtml, 'src="/uploads/', 'src="http://localhost:31875/uploads/') WHERE contentHtml LIKE '%src="/uploads/%';
UPDATE Service  SET contentHtml = REPLACE(contentHtml, 'src="/uploads/', 'src="http://localhost:31875/uploads/') WHERE contentHtml LIKE '%src="/uploads/%';
UPDATE ArchitectureDesignTemplate SET contentHtml = REPLACE(contentHtml, 'src="/uploads/', 'src="http://localhost:31875/uploads/') WHERE contentHtml LIKE '%src="/uploads/%';
SELECT COUNT(*) AS media_absolute FROM MediaFile WHERE webpUrl LIKE 'http%';
SELECT COUNT(*) AS media_relative FROM MediaFile WHERE webpUrl LIKE '/uploads/%';
