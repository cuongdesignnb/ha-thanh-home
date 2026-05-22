SELECT product_id,
  (CHAR_LENGTH(product_desc) - CHAR_LENGTH(REPLACE(product_desc, '<img', ''))) / 4 AS desc_imgs,
  (CHAR_LENGTH(product_content) - CHAR_LENGTH(REPLACE(product_content, '<img', ''))) / 4 AS content_imgs,
  (CHAR_LENGTH(IFNULL(product_descs,'')) - CHAR_LENGTH(REPLACE(IFNULL(product_descs,''), '<img', ''))) / 4 AS descs_imgs
FROM products WHERE product_id IN (36, 114, 115, 116, 117, 118, 119, 120);
