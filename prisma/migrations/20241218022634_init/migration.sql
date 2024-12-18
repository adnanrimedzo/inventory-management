-- CreateTable
CREATE TABLE `fx_rate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency_x` VARCHAR(3) NOT NULL,
    `currency_y` VARCHAR(3) NOT NULL,
    `rate` DECIMAL(65, 30) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fx_rate_currency_x_currency_y_date_idx`(`currency_x`, `currency_y`, `date` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `external_reference_id` VARCHAR(191) NOT NULL,
    `currency_x` VARCHAR(3) NOT NULL,
    `currency_y` VARCHAR(3) NOT NULL,
    `amount` BIGINT NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `transfer_external_reference_id_key`(`external_reference_id`),
    INDEX `transfer_currency_x_date_idx`(`currency_x`, `date` DESC),
    INDEX `transfer_currency_y_date_idx`(`currency_y`, `date` DESC),
    INDEX `transfer_status_date_idx`(`status`, `date` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settlement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transferId` INTEGER NOT NULL,
    `currency_x` VARCHAR(3) NOT NULL,
    `currency_y` VARCHAR(3) NOT NULL,
    `rate` DECIMAL(65, 30) NOT NULL,
    `margin` DECIMAL(65, 30) NOT NULL,
    `amount` BIGINT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settlement_transferId_key`(`transferId`),
    INDEX `settlement_currency_x_date_idx`(`currency_x`, `date` DESC),
    INDEX `settlement_currency_y_date_idx`(`currency_y`, `date` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `liquidity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(191) NOT NULL,
    `amount` BIGINT NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `liquidity_currency_key`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `liquidity_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(191) NOT NULL,
    `amount` BIGINT NOT NULL,
    `date` DATETIME(3) NOT NULL,

    INDEX `liquidity_history_currency_date_idx`(`currency`, `date` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(191) NOT NULL,
    `amount` BIGINT NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `revenue_currency_key`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
