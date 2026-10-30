CREATE DATABASE IF NOT EXISTS `cafe_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cafe_db`;

-- 商品テーブル
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `price` INT NOT NULL,
    `description` TEXT,
    `stock_quantity` INT NOT NULL DEFAULT 50,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 注文ヘッダーテーブル
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(10) NOT NULL UNIQUE,
    `total_price` INT NOT NULL,
    `status` ENUM('preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'preparing',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 注文明細テーブル
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` INT NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4つのクロッフル初期データ
INSERT INTO `products` (`name`, `price`, `description`, `stock_quantity`, `is_available`) VALUES
('チョコオレオ', 350, '濃厚チョコソースと砕いたオレオが相性抜群！一番人気。', 50, 1),
('あんバター', 350, '北海道産小豆の甘みと濃厚バターの塩気がクセになる和風クロッフル。', 50, 1),
('ハムチーズ', 400, 'とろけるチーズとジューシーなハムの定番お食事系クロッフル。', 50, 1),
('チーズ&ブラックペッパー', 400, '香ばしいチーズにピリッと効いた黒胡椒が大人のアクセント。', 50, 1);