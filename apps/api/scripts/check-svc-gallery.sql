SELECT s.id, LEFT(s.title, 50) AS title,
  JSON_LENGTH(s.galleryMediaIds) AS gallery_count,
  LENGTH(s.contentHtml) AS html_len,
  (LENGTH(s.contentHtml) - LENGTH(REPLACE(s.contentHtml, '<img', ''))) / 4 AS img_in_html
FROM Service s WHERE s.icon='xay-nha-tron-goi' ORDER BY s.id LIMIT 8;
