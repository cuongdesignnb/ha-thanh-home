SET @hash := '286vx901';
SELECT 'product_groupb' AS col, product_id FROM products WHERE product_groupb LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_options', product_id FROM products WHERE product_options LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_optionsx', product_id FROM products WHERE product_optionsx LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_thuoctinh', product_id FROM products WHERE product_thuoctinh LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_thongsokythuat', product_id FROM products WHERE product_thongsokythuat LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_uudai', product_id FROM products WHERE product_uudai LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_bienthemau', product_id FROM products WHERE product_bienthemau LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_fields', product_id FROM products WHERE product_fields LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_quatang', product_id FROM products WHERE product_quatang LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_descs', product_id FROM products WHERE product_descs LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_subcat', product_id FROM products WHERE product_subcat LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'product_groupb_news', product_id FROM products WHERE product_groupb LIKE '%286vx901%'
UNION ALL SELECT 'news.tintuc_info', tintuc_id FROM news WHERE tintuc_info LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'news.tintuc_thumb', tintuc_id FROM news WHERE tintuc_thumb LIKE CONCAT('%', @hash, '%')
UNION ALL SELECT 'projects.project_gallery', project_id FROM projects WHERE project_gallery LIKE CONCAT('%', @hash, '%');
