/**
 * Report Controller
 * Handles CSV report generation for orders and clients
 */

const fs = require('fs');
const { stringify } = require("csv-stringify");
const db = require('../../module/database/db');

/**
 * Generate orders CSV report
 * GET /accountant/createFileReportOrders/
 */
async function createOrdersReport(req, res, next) {
    try {
        console.log("REPORT FILE CREATE ON " + Date());
        
        // Generate filename with timestamp
        const filename = generateReportFilename('orders');
        const writableStream = fs.createWriteStream('public/report/' + filename);
        
        // Define Hebrew CSV columns
        const columns = [
            "",
            "מס. לקוח",
            "שם לקוח",
            "פרטים",
            "תאריך",
            "סכום"
        ];
        
        // Create CSV stringifier with BOM for Hebrew Excel support
        const stringifier = stringify({ 
            header: true, 
            columns: columns, 
            bom: true 
        });
        
        // Fetch orders data (scope 5 = formatted orders)
        const data = await db.dbGetDataByScope(5);
        
        // Write each row to CSV
        for (let i = 0; i < data.length; i++) {
            const row = [
                "", 
                data[i].account, 
                data[i].client, 
                data[i].info, 
                "פאב " + data[i].date, 
                "₪ " + data[i].sum
            ];
            stringifier.write(row);
        }
        
        stringifier.pipe(writableStream);
        
        // Send response with file path
        res.setHeader('Content-disposition', "'attachment; filename=" + filename + "'");
        res.set('Content-Type', 'text/csv; charset=utf-8');
        res.status(200).send('./report/' + filename);
        
    } catch (error) {
        next(error);
    }
}

/**
 * Generate clients CSV report
 * GET /accountant/createFileReportClients/
 */
async function createClientsReport(req, res, next) {
    try {
        // Generate filename with timestamp
        const filename = generateReportFilename('clients');
        const writableStream = fs.createWriteStream('public/report/' + filename);
        
        // Define Hebrew CSV columns
        const columns = [
            "",
            "מס. לקוח",
            "שם לקוח",
            "פרטים",
            "סכום"
        ];
        
        // Create CSV stringifier with BOM for Hebrew Excel support
        const stringifier = stringify({ 
            header: true, 
            columns: columns, 
            bom: true 
        });
        
        // Fetch clients data (scope 4 = formatted clients)
        const data = await db.dbGetDataByScope(4);
        
        // Write each row to CSV
        for (let i = 0; i < data.length; i++) {
            const row = [
                "", 
                data[i].account, 
                data[i].name, 
                "פאב " + data[i].date, 
                "₪ " + data[i].sum
            ];
            stringifier.write(row);
        }
        
        stringifier.pipe(writableStream);
        
        // Send response with file path
        res.setHeader('Content-disposition', "'attachment; filename=" + filename + "'");
        res.set('Content-Type', 'text/csv; charset=utf-8');
        res.status(200).send('./report/' + filename);
        
    } catch (error) {
        next(error);
    }
}

/**
 * Helper: Generate timestamped filename
 * @param {string} type - 'orders' or 'clients'
 * @returns {string} Formatted filename
 */
function generateReportFilename(type) {
    const fileDate = new Date();
    const month = fileDate.getMonth() + 1;
    const minutes = ("0" + fileDate.getMinutes()).slice(-2);
    
    const dateString = fileDate.getFullYear().toString().substr(-2) + "-" + 
                       month + "-" +
                       fileDate.getDate() + "-" + 
                       fileDate.getHours() + "-" + 
                       minutes;
    
    if (type === 'orders') {
        return "pub_orders_" + dateString + ".csv";
    } else {
        return "pub_report_clients_" + dateString + ".csv";
    }
}

module.exports = {
    createOrdersReport,
    createClientsReport
};
