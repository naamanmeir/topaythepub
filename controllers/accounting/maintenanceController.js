/**
 * Maintenance Controller
 * Handles backup, reset, and maintenance operations
 */

const db = require('../../module/database/db');

/**
 * Remove old backup files
 * GET /accountant/removeOldBackups/
 * GET /manage/removeOldBackups/
 */
async function removeOldBackups(req, res, next) {
    try {
        const time = Date.now();
        console.log("REMOVING OLD BACKUPS ON: " + Date());
        
        const result = await db.dbDeleteOldBackups(time);
        res.send("ניקוי גיבויים ישנים הצליח"); // "Old backups cleanup succeeded"
    } catch (error) {
        next(error);
    }
}

/**
 * Reset client data and create backup
 * GET /accountant/resetClientsDataAfterRead/
 * GET /manage/resetClientsDataAfterRead/
 */
async function resetClientsData(req, res, next) {
    try {
        console.log("REQUESTED RESET ON: " + Date());
        
        // Create backup before reset
        const time = Date.now();
        await db.dbBackupTable(time);
        
        // Reset client sums to zero
        await db.dbResetClientOrders();
        
        console.log("RESET SUCCESS");
        res.send("איפוס סכומי לקוחות הצליח"); // "Client sums reset succeeded"
    } catch (error) {
        next(error);
    }
}

/**
 * Create manual backup
 * POST /accountant/backupTable/
 * POST /manage/backupTable/
 */
async function createBackup(req, res, next) {
    try {
        const time = Date.now();
        console.log("BACKUP CREATE ON: " + Date());
        
        await db.dbBackupTable(time);
        res.send("גיבוי הצליח"); // "Backup succeeded"
    } catch (error) {
        next(error);
    }
}

module.exports = {
    removeOldBackups,
    resetClientsData,
    createBackup
};
