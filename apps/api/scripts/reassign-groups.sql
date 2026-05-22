UPDATE Service SET `group` = 'xay_nha_tron_goi' WHERE icon = 'xay-nha-tron-goi';
SELECT `group`, COUNT(*) n FROM Service GROUP BY `group`;
