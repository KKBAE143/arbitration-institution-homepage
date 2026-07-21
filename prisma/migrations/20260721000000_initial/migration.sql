-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'ARBITRATOR', 'PARTY') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `setupTokenHash` VARCHAR(191) NULL,
    `setupTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArbitratorProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `bio` TEXT NOT NULL,
    `externalProfileUrl` VARCHAR(191) NULL,
    `isProminent` BOOLEAN NOT NULL DEFAULT false,
    `photoBase64` LONGTEXT NULL,
    `empanelmentStatus` ENUM('PENDING', 'APPROVED', 'EXPIRED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    `renewalDueDate` DATETIME(3) NULL,
    `applicationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ArbitratorProfile_userId_key`(`userId`),
    UNIQUE INDEX `ArbitratorProfile_slug_key`(`slug`),
    UNIQUE INDEX `ArbitratorProfile_applicationId_key`(`applicationId`),
    INDEX `ArbitratorProfile_empanelmentStatus_idx`(`empanelmentStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArbitratorSpecialization` (
    `id` VARCHAR(191) NOT NULL,
    `arbitratorId` VARCHAR(191) NOT NULL,
    `specialization` ENUM('COMMERCIAL', 'BANKING', 'FINANCIAL', 'INFRASTRUCTURE', 'LOAN_RECOVERY', 'OTHER') NOT NULL,

    INDEX `ArbitratorSpecialization_specialization_idx`(`specialization`),
    UNIQUE INDEX `ArbitratorSpecialization_arbitratorId_specialization_key`(`arbitratorId`, `specialization`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArbitratorAvailability` (
    `id` VARCHAR(191) NOT NULL,
    `arbitratorId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ArbitratorAvailability_arbitratorId_startDate_endDate_idx`(`arbitratorId`, `startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmpanelmentApplication` (
    `id` VARCHAR(191) NOT NULL,
    `applicantName` VARCHAR(191) NOT NULL,
    `applicantEmail` VARCHAR(191) NOT NULL,
    `applicantPhone` VARCHAR(191) NOT NULL,
    `professionalBackground` TEXT NOT NULL,
    `proposedSpecializations` JSON NOT NULL,
    `stage` ENUM('APPLIED', 'DOCUMENT_VERIFIED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPLIED',
    `interviewScheduledAt` DATETIME(3) NULL,
    `reviewerNotes` TEXT NULL,
    `registrationFeePaid` BOOLEAN NOT NULL DEFAULT false,
    `registrationFeePaidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmpanelmentApplication_stage_idx`(`stage`),
    INDEX `EmpanelmentApplication_applicantEmail_idx`(`applicantEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmpanelmentDocument` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `contentBase64` LONGTEXT NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmpanelmentDocument_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DisputeReferral` (
    `id` VARCHAR(191) NOT NULL,
    `referrerName` VARCHAR(191) NOT NULL,
    `referrerEmail` VARCHAR(191) NOT NULL,
    `referrerPhone` VARCHAR(191) NULL,
    `entityType` ENUM('BANK', 'NBFC', 'LAW_FIRM', 'ADVOCATE', 'INDIVIDUAL', 'OTHER') NOT NULL,
    `disputeSummary` TEXT NOT NULL,
    `status` ENUM('NEW', 'UNDER_REVIEW', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `convertedCaseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DisputeReferral_convertedCaseId_key`(`convertedCaseId`),
    INDEX `DisputeReferral_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Case` (
    `id` VARCHAR(191) NOT NULL,
    `caseNumber` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `counterpartyName` VARCHAR(191) NULL,
    `referringEntityType` ENUM('BANK', 'NBFC', 'LAW_FIRM', 'ADVOCATE', 'INDIVIDUAL', 'OTHER') NOT NULL,
    `claimAmount` DECIMAL(14, 2) NOT NULL,
    `isFastTrack` BOOLEAN NOT NULL DEFAULT false,
    `isEmergency` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'FILED', 'UNDER_REVIEW', 'ARBITRATOR_ASSIGNED', 'IN_HEARING', 'AWARD_PASSED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `partyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Case_caseNumber_key`(`caseNumber`),
    INDEX `Case_status_idx`(`status`),
    INDEX `Case_referringEntityType_idx`(`referringEntityType`),
    INDEX `Case_partyId_idx`(`partyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaseArbitrator` (
    `id` VARCHAR(191) NOT NULL,
    `caseId` VARCHAR(191) NOT NULL,
    `arbitratorId` VARCHAR(191) NOT NULL,
    `role` ENUM('SOLE', 'PRESIDING', 'CLAIMANT_NOMINEE', 'RESPONDENT_NOMINEE', 'EMERGENCY_ARBITRATOR') NOT NULL,
    `appointedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CaseArbitrator_arbitratorId_idx`(`arbitratorId`),
    UNIQUE INDEX `CaseArbitrator_caseId_arbitratorId_key`(`caseId`, `arbitratorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaseStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `caseId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'FILED', 'UNDER_REVIEW', 'ARBITRATOR_ASSIGNED', 'IN_HEARING', 'AWARD_PASSED', 'CLOSED') NOT NULL,
    `note` TEXT NULL,
    `changedByUserId` VARCHAR(191) NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CaseStatusHistory_caseId_changedAt_idx`(`caseId`, `changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaseDocument` (
    `id` VARCHAR(191) NOT NULL,
    `caseId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `contentBase64` LONGTEXT NOT NULL,
    `documentType` ENUM('FILING', 'EVIDENCE', 'ORDER', 'AWARD', 'OTHER') NOT NULL,
    `uploadedByUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CaseDocument_caseId_documentType_idx`(`caseId`, `documentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ARBITRATION_ROOM', 'CONFERENCE_ROOM', 'EVENT_SPACE', 'MEETING_HALL', 'FLOOR') NOT NULL,
    `floorLabel` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `description` TEXT NULL,
    `indicativeRate` DECIMAL(10, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Facility_type_isActive_idx`(`type`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacilityBooking` (
    `id` VARCHAR(191) NOT NULL,
    `caseId` VARCHAR(191) NULL,
    `facilityId` VARCHAR(191) NOT NULL,
    `bookingType` ENUM('PHYSICAL_ROOM', 'VIRTUAL_HEARING', 'HYBRID') NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `virtualMeetingUrl` VARCHAR(191) NULL,
    `secretarialAssistanceRequired` BOOLEAN NOT NULL DEFAULT false,
    `assignedStaffName` VARCHAR(191) NULL,
    `source` ENUM('ADMIN', 'CASE_LINKED', 'EXTERNAL_PUBLIC') NOT NULL,
    `isPriority` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requesterName` VARCHAR(191) NOT NULL,
    `requesterEmail` VARCHAR(191) NOT NULL,
    `requesterPhone` VARCHAR(191) NULL,
    `recordedByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FacilityBooking_facilityId_startTime_endTime_idx`(`facilityId`, `startTime`, `endTime`),
    INDEX `FacilityBooking_status_idx`(`status`),
    INDEX `FacilityBooking_caseId_idx`(`caseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeeSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `category` ENUM('ADMINISTRATIVE', 'FILING', 'ARBITRATOR', 'ROOM_RENTAL', 'REGISTRATION', 'ANNUAL_RENEWAL', 'MEMBERSHIP') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `tier` VARCHAR(191) NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FeeSchedule_category_isActive_idx`(`category`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeePayment` (
    `id` VARCHAR(191) NOT NULL,
    `feeScheduleId` VARCHAR(191) NULL,
    `caseId` VARCHAR(191) NULL,
    `empanelmentApplicationId` VARCHAR(191) NULL,
    `arbitratorProfileId` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `status` ENUM('UNPAID', 'PAID', 'WAIVED') NOT NULL DEFAULT 'UNPAID',
    `paidAt` DATETIME(3) NULL,
    `recordedByUserId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FeePayment_status_idx`(`status`),
    INDEX `FeePayment_caseId_idx`(`caseId`),
    INDEX `FeePayment_empanelmentApplicationId_idx`(`empanelmentApplicationId`),
    INDEX `FeePayment_arbitratorProfileId_idx`(`arbitratorProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentBlock` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `updatedByUserId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ContentBlock_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resource` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('MANUAL', 'BROCHURE', 'FEE_SCHEDULE', 'RULES', 'RFI_RESPONSE', 'OTHER') NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `contentBase64` LONGTEXT NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `uploadedByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Resource_category_isPublished_idx`(`category`, `isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelClauseTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `disputeType` VARCHAR(191) NOT NULL,
    `seat` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'English',
    `isFastTrackVariant` BOOLEAN NOT NULL DEFAULT false,
    `clauseText` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ModelClauseTemplate_disputeType_isFastTrackVariant_isActive_idx`(`disputeType`, `isFastTrackVariant`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArbitratorProfile` ADD CONSTRAINT `ArbitratorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArbitratorProfile` ADD CONSTRAINT `ArbitratorProfile_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `EmpanelmentApplication`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArbitratorSpecialization` ADD CONSTRAINT `ArbitratorSpecialization_arbitratorId_fkey` FOREIGN KEY (`arbitratorId`) REFERENCES `ArbitratorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArbitratorAvailability` ADD CONSTRAINT `ArbitratorAvailability_arbitratorId_fkey` FOREIGN KEY (`arbitratorId`) REFERENCES `ArbitratorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpanelmentDocument` ADD CONSTRAINT `EmpanelmentDocument_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `EmpanelmentApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisputeReferral` ADD CONSTRAINT `DisputeReferral_convertedCaseId_fkey` FOREIGN KEY (`convertedCaseId`) REFERENCES `Case`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Case` ADD CONSTRAINT `Case_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseArbitrator` ADD CONSTRAINT `CaseArbitrator_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `Case`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseArbitrator` ADD CONSTRAINT `CaseArbitrator_arbitratorId_fkey` FOREIGN KEY (`arbitratorId`) REFERENCES `ArbitratorProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseStatusHistory` ADD CONSTRAINT `CaseStatusHistory_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `Case`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseStatusHistory` ADD CONSTRAINT `CaseStatusHistory_changedByUserId_fkey` FOREIGN KEY (`changedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseDocument` ADD CONSTRAINT `CaseDocument_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `Case`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseDocument` ADD CONSTRAINT `CaseDocument_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityBooking` ADD CONSTRAINT `FacilityBooking_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `Case`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityBooking` ADD CONSTRAINT `FacilityBooking_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facility`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityBooking` ADD CONSTRAINT `FacilityBooking_recordedByUserId_fkey` FOREIGN KEY (`recordedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_feeScheduleId_fkey` FOREIGN KEY (`feeScheduleId`) REFERENCES `FeeSchedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `Case`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_empanelmentApplicationId_fkey` FOREIGN KEY (`empanelmentApplicationId`) REFERENCES `EmpanelmentApplication`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_arbitratorProfileId_fkey` FOREIGN KEY (`arbitratorProfileId`) REFERENCES `ArbitratorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayment` ADD CONSTRAINT `FeePayment_recordedByUserId_fkey` FOREIGN KEY (`recordedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentBlock` ADD CONSTRAINT `ContentBlock_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resource` ADD CONSTRAINT `Resource_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

