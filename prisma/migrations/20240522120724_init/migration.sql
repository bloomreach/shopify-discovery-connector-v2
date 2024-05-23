-- CreateTable
CREATE TABLE `store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shop_url` VARCHAR(250) NULL,
    `autosuggest_template_version` VARCHAR(100) NULL,
    `search_template_version` VARCHAR(100) NULL,
    `search_product_list_template_version` VARCHAR(100) NULL,
    `category_template_version` VARCHAR(100) NULL,
    `category_product_list_template_version` VARCHAR(100) NULL,
    `recommendations_template_version` VARCHAR(100) NULL,
    `default_templates_added` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `store_shop_url_key`(`shop_url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(250) NOT NULL,
    `shop` VARCHAR(250) NOT NULL,
    `state` VARCHAR(250) NOT NULL,
    `scope` VARCHAR(250) NULL,
    `expires` DATETIME(3) NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `accessToken` VARCHAR(250) NOT NULL,
    `userId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
