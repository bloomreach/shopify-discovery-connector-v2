-- AlterTable
ALTER TABLE `session` ADD COLUMN `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `collaborator` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `email` VARCHAR(250) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `firstName` VARCHAR(250) NULL,
    ADD COLUMN `lastName` VARCHAR(250) NULL,
    ADD COLUMN `locale` VARCHAR(250) NULL;
