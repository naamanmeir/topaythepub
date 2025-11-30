const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('../database/db.js');

class WhatsAppPubBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "pub-bot"
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.activeOrders = new Map(); // Store user ordering sessions
        this.customerSessions = new Map(); // Store customer authentication
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('WhatsApp QR Code generated. Scan with your phone:');
            qrcode.generate(qr, {small: true});
        });

        this.client.on('ready', () => {
            console.log('🍺 WhatsApp Pub Bot is ready and connected!');
        });

        this.client.on('message', async (message) => {
            try {
                await this.handleMessage(message);
            } catch (error) {
                console.error('Error handling WhatsApp message:', error);
                await this.sendErrorMessage(message.from);
            }
        });

        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp Bot disconnected:', reason);
        });
    }

    async handleMessage(message) {
        // Ignore group messages and status updates
        if (message.from.includes('@g.us') || message.from.includes('status@broadcast')) {
            return;
        }

        const phoneNumber = message.from.replace('@c.us', '');
        const messageText = message.body.toLowerCase().trim();

        // Log incoming message
        console.log(`WhatsApp message from ${phoneNumber}: ${messageText}`);

        // Main command routing
        switch (true) {
            case ['התחל', 'start', 'תפריט', 'היי', 'שלום'].includes(messageText):
                await this.sendMainMenu(message.from);
                break;
                
            case ['רישום', 'הזמנה', 'להזמין'].includes(messageText):
                await this.startOrderProcess(message.from, phoneNumber);
                break;
                
            case ['חשבון', 'יתרה', 'כסף'].includes(messageText):
                await this.showAccountInfo(message.from, phoneNumber);
                break;
                
            case ['עזרה', 'help', 'מידע'].includes(messageText):
                await this.sendHelpMenu(message.from);
                break;
                
            case ['רישום משתמש', 'הרשמה', 'חשבון חדש'].includes(messageText):
                await this.startRegistrationProcess(message.from, phoneNumber);
                break;
                
            case ['סיום', 'גמור', 'לסיים'].includes(messageText):
                await this.finalizeOrder(message.from, phoneNumber);
                break;
                
            case ['ביטול', 'בטל', 'לבטל'].includes(messageText):
                await this.cancelOrder(message.from);
                break;
                
            default:
                await this.handleOrderInput(message.from, messageText, phoneNumber);
                break;
        }
    }

    async sendMainMenu(chatId) {
        const menuText = `
🍺 *ברוכים הבאים לפאב אבירים* 🍺

*בחרו פעולה:*
📋 *תפריט* - צפייה בתפריט המלא והזמנה
💰 *חשבון* - צפייה ביתרת החשבון
👤 *רישום משתמש* - יצירת חשבון חדש
❓ *עזרה* - מידע ועזרה

*כתבו את המילה המתאימה לפעולה הרצויה.*

_לדוגמה: כתבו "תפריט" כדי להתחיל הזמנה_
        `;
        
        await this.client.sendMessage(chatId, menuText);
    }

    async startOrderProcess(chatId, phoneNumber) {
        try {
            // Check if customer exists
            const customer = await this.getCustomerByPhone(phoneNumber);
            if (!customer) {
                await this.client.sendMessage(chatId, 
                    `❌ *לא נמצא חשבון*
                    
המספר ${phoneNumber} לא רשום במערכת.

*כדי להירשם:*
כתבו: *רישום משתמש*

*או פנו למנהל הפאב* 📞`);
                return;
            }

            // Get products from database
            const products = await db.dbGetProducts();
            if (!products || products.length === 0) {
                await this.client.sendMessage(chatId, 'מצטערים, התפריט לא זמין כרגע. נסו שוב מאוחר יותר.');
                return;
            }

            // Create menu text
            let menuText = `🍽️ *תפריט פאב אבירים* 🍽️\n\n`;
            
            products.forEach((product, index) => {
                const status = product.stock > 0 ? '✅' : '❌';
                menuText += `${index + 1}. ${status} *${product.itemname}* - ${product.price}₪\n`;
            });
            
            menuText += `
📝 *איך מזמינים:*
כתבו: [מספר פריט] [כמות]
*דוגמה:* 1 2 (עבור 2 יחידות מפריט 1)

*פקודות שימושיות:*
• *סיום* - לסיום ההזמנה ✅
• *ביטול* - לביטול ההזמנה ❌
• *תפריט* - להצגת התפריט שוב 📋

👤 *מזמין:* ${customer.name}
💰 *יתרה נוכחית:* ${customer.account}₪`;
            
            await this.client.sendMessage(chatId, menuText);
            
            // Initialize order session
            this.activeOrders.set(chatId, {
                customerId: customer.id,
                customerName: customer.name,
                items: {},
                step: 'ordering',
                startTime: Date.now()
            });
            
            // Set timeout for order session (15 minutes)
            setTimeout(() => {
                if (this.activeOrders.has(chatId)) {
                    this.activeOrders.delete(chatId);
                    this.client.sendMessage(chatId, '⏰ זמן ההזמנה פג. התחילו הזמנה חדשה.');
                }
            }, 15 * 60 * 1000);
            
        } catch (error) {
            console.error('Error in startOrderProcess:', error);
            await this.client.sendMessage(chatId, 'אירעה שגיאה בטעינת התפריט. נסו שוב מאוחר יותר.');
        }
    }

    async handleOrderInput(chatId, input, phoneNumber) {
        const orderSession = this.activeOrders.get(chatId);
        
        if (!orderSession || orderSession.step !== 'ordering') {
            // Not in ordering mode, show main menu
            await this.sendMainMenu(chatId);
            return;
        }

        // Parse order input (support multiple formats)
        const orderMatch = input.match(/(\d+)\s+(\d+)/);
        if (orderMatch) {
            const itemId = parseInt(orderMatch[1]);
            const quantity = parseInt(orderMatch[2]);
            
            if (quantity <= 0 || quantity > 99) {
                await this.client.sendMessage(chatId, 
                    '❌ כמות לא תקינה. הכמות חייבת להיות בין 1 ל-99.');
                return;
            }
            
            try {
                // Get product details
                const products = await db.dbGetProducts();
                const product = products[itemId - 1]; // Array is 0-indexed, user input is 1-indexed
                
                if (!product) {
                    await this.client.sendMessage(chatId, 
                        '❌ מספר פריט לא קיים. בדקו את התפריט ונסו שוב.');
                    return;
                }

                if (product.stock === 0) {
                    await this.client.sendMessage(chatId, 
                        `❌ מצטערים, ${product.itemname} לא זמין כרגע.`);
                    return;
                }
                
                // Add to order
                orderSession.items[product.itemid] = (orderSession.items[product.itemid] || 0) + quantity;
                
                const totalQuantity = orderSession.items[product.itemid];
                const itemTotal = product.price * totalQuantity;
                
                await this.client.sendMessage(chatId, 
                    `✅ *נוסף לסל:*
${quantity} x ${product.itemname} (${product.price}₪ ליחידה)

📊 *בסל שלכם:*
${totalQuantity} x ${product.itemname} = ${itemTotal}₪

*להמשך:* הוסיפו פריטים נוספים
*לסיום:* כתבו *סיום*
*לביטול:* כתבו *ביטול*`);
                
            } catch (error) {
                console.error('Error processing order input:', error);
                await this.client.sendMessage(chatId, 'אירעה שגיאה בעיבוד ההזמנה. נסו שוב.');
            }
        } else {
            await this.client.sendMessage(chatId, 
                `❌ *פורמט לא נכון*

*כתבו:* [מספר פריט] [כמות]
*דוגמה:* 1 2

*או השתמשו בפקודות:*
• *תפריט* - להצגת התפריט
• *סיום* - לסיום ההזמנה
• *ביטול* - לביטול ההזמנה`);
        }
    }

    async finalizeOrder(chatId, phoneNumber) {
        const orderSession = this.activeOrders.get(chatId);
        
        if (!orderSession || Object.keys(orderSession.items).length === 0) {
            await this.client.sendMessage(chatId, 
                'אין פריטים בהזמנה. התחילו הזמנה חדשה עם *תפריט*.');
            this.activeOrders.delete(chatId);
            return;
        }

        try {
            // Calculate order details
            let orderInfo = '';
            let totalPrice = 0;
            let orderSummary = '*סיכום ההזמנה:*\n\n';
            
            for (const [itemId, quantity] of Object.entries(orderSession.items)) {
                const product = await db.dbGetProductDetailsById(parseInt(itemId));
                if (product.length > 0) {
                    const itemTotal = product[0].price * quantity;
                    totalPrice += itemTotal;
                    orderInfo += `${product[0].itemname} x${quantity}, `;
                    orderSummary += `• ${quantity} x ${product[0].itemname} = ${itemTotal}₪\n`;
                }
            }

            orderSummary += `\n💰 *סה"כ:* ${totalPrice}₪`;
            orderSummary += `\n👤 *לחשבון:* ${orderSession.customerName}`;

            // Send confirmation request
            const confirmationText = `
${orderSummary}

*❓ לאשר את ההזמנה?*
• כתבו *כן* לאישור
• כתבו *לא* לביטול
            `;
            
            await this.client.sendMessage(chatId, confirmationText);
            
            // Update session state
            orderSession.step = 'confirming';
            orderSession.orderInfo = orderInfo;
            orderSession.totalPrice = totalPrice;
            
            // Set confirmation timeout (2 minutes)
            setTimeout(() => {
                if (this.activeOrders.has(chatId) && this.activeOrders.get(chatId).step === 'confirming') {
                    this.activeOrders.delete(chatId);
                    this.client.sendMessage(chatId, '⏰ זמן האישור פג. התחילו הזמנה חדשה.');
                }
            }, 2 * 60 * 1000);
            
        } catch (error) {
            console.error('Error finalizing order:', error);
            await this.client.sendMessage(chatId, 'אירעה שגיאה בעיבוד ההזמנה. נסו שוב.');
            this.activeOrders.delete(chatId);
        }
    }

    async confirmOrder(chatId, phoneNumber) {
        const orderSession = this.activeOrders.get(chatId);
        
        if (!orderSession || orderSession.step !== 'confirming') {
            return;
        }

        try {
            // Save order to database
            const orderTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            await db.dbInsertOrderToOrders(
                orderTime, 
                orderSession.customerId, 
                orderSession.orderInfo, 
                orderSession.totalPrice
            );

            await db.dbInsertOrderToClient(
                orderTime, 
                orderSession.customerId, 
                orderSession.totalPrice
            );

            // Send success confirmation
            const successText = `
✅ *ההזמנה התקבלה בהצלחה!*

📋 *מספר הזמנה:* ${Date.now().toString().slice(-6)}
⏰ *זמן הזמנה:* ${new Date().toLocaleString('he-IL')}
💰 *סכום:* ${orderSession.totalPrice}₪
👤 *מזמין:* ${orderSession.customerName}

🍺 *תודה שבחרתם בפאב אבירים!*
ההזמנה תתכונן בקרוב.

*להזמנה נוספת כתבו:* *תפריט*
            `;
            
            await this.client.sendMessage(chatId, successText);
            
            // Log order
            console.log(`WhatsApp order confirmed: ${orderSession.orderInfo} Total: ${orderSession.totalPrice}₪ Customer: ${orderSession.customerName}`);
            
        } catch (error) {
            console.error('Error confirming order:', error);
            await this.client.sendMessage(chatId, 
                'אירעה שגיאה בשמירת ההזמנה. אנא פנו למנהל הפאב.');
        }
        
        this.activeOrders.delete(chatId);
    }

    async cancelOrder(chatId) {
        if (this.activeOrders.has(chatId)) {
            this.activeOrders.delete(chatId);
            await this.client.sendMessage(chatId, 
                '❌ ההזמנה בוטלה.\n\nלהזמנה חדשה כתבו: *תפריט*');
        } else {
            await this.client.sendMessage(chatId, 
                'אין הזמנה פעילה לביטול.\n\nלהתחלת הזמנה כתבו: *תפריט*');
        }
    }

    async getCustomerByPhone(phoneNumber) {
        try {
            const customer = await db.dbGetClientByPhone(phoneNumber);
            return customer && customer.length > 0 ? customer[0] : null;
        } catch (error) {
            console.error('Error getting customer by phone:', error);
            return null;
        }
    }

    async showAccountInfo(chatId, phoneNumber) {
        try {
            const customer = await this.getCustomerByPhone(phoneNumber);
            if (!customer) {
                await this.client.sendMessage(chatId, 
                    `❌ *לא נמצא חשבון*
                    
המספר ${phoneNumber} לא רשום במערכת.

*להרשמה:* כתבו *רישום משתמש*
*או פנו למנהל הפאב* 📞`);
                return;
            }

            const orders = await db.dbGetClientOrdersById(customer.id);
            const recentOrders = orders.slice(0, 5); // Show last 5 orders
            
            let accountText = `
👤 *פרטי החשבון*

🏷️ *שם:* ${customer.name}
📞 *טלפון:* ${phoneNumber}
💰 *יתרה נוכחית:* ${customer.account}₪
📊 *סה"כ הזמנות:* ${orders.length}
📅 *פעילות אחרונה:* ${new Date(customer.last_action).toLocaleDateString('he-IL')}
            `;
            
            if (recentOrders.length > 0) {
                accountText += '\n📋 *הזמנות אחרונות:*\n';
                recentOrders.forEach((order, index) => {
                    const date = new Date(order.time).toLocaleDateString('he-IL');
                    const status = order.sign === 0 ? '⏳ ממתין' : '✅ שולם';
                    accountText += `${index + 1}. ${date} - ${order.sum}₪ ${status}\n`;
                });
            }
            
            accountText += '\n*להזמנה חדשה כתבו:* *תפריט*';
            
            await this.client.sendMessage(chatId, accountText);
            
        } catch (error) {
            console.error('Error showing account info:', error);
            await this.client.sendMessage(chatId, 'אירעה שגיאה בטעינת פרטי החשבון.');
        }
    }

    async startRegistrationProcess(chatId, phoneNumber) {
        const registrationText = `
👋 *רישום חשבון חדש*

*שלב 1:* שלחו את השם המלא שלכם
*דוגמה:* יוסי כהן

לאחר שליחת השם, נבקש ממכם לבחור כינוי.

*הערה:* החשבון יתחיל עם יתרה של 0₪
        `;
        
        await this.client.sendMessage(chatId, registrationText);
        
        // Set registration session
        this.customerSessions.set(chatId, {
            step: 'waiting_for_name',
            phone: phoneNumber,
            startTime: Date.now()
        });
        
        // Set timeout for registration (5 minutes)
        setTimeout(() => {
            if (this.customerSessions.has(chatId)) {
                this.customerSessions.delete(chatId);
                this.client.sendMessage(chatId, '⏰ זמן הרישום פג. התחילו שוב עם *רישום משתמש*.');
            }
        }, 5 * 60 * 1000);
    }

    async sendHelpMenu(chatId) {
        const helpText = `
❓ *עזרה - פאב אבירים*

*🔥 פקודות עיקריות:*
• *תפריט* - צפייה בתפריט והזמנה
• *חשבון* - פרטי החשבון שלכם
• *רישום משתמש* - יצירת חשבון חדש
• *עזרה* - התפריט הזה

*🍺 איך מזמינים?*
1. כתבו *תפריט*
2. בחרו פריטים: [מספר] [כמות]
3. כתבו *סיום* לאישור ההזמנה

*📝 דוגמאות:*
• 1 2 → 2 בירות (פריט ראשון)
• 3 1 → 1 נשנוש (פריט שלישי)
• *סיום* → אישור ההזמנה

*🛠️ פקודות נוספות:*
• *ביטול* - ביטול הזמנה נוכחית
• *כן/לא* - אישור/ביטול בזמן אישור הזמנה

*📞 צריכים עזרה נוספת?*
פנו למנהל הפאב: [מספר טלפון]

*⏰ שעות פעילות:*
ראשון-חמישי: 17:00-02:00
שישי-שבת: 19:00-03:00

🍺 *פאב אבירים - הבית שלכם!*
        `;
        
        await this.client.sendMessage(chatId, helpText);
    }

    async sendErrorMessage(chatId) {
        await this.client.sendMessage(chatId, 
            `⚠️ אירעה שגיאה בעיבוד הבקשה.

נסו שוב או כתבו *עזרה* למידע נוסף.
במקרה של בעיה מתמשכת, פנו למנהל הפאב.`);
    }

    // Handle message confirmations
    async handleConfirmation(chatId, input, phoneNumber) {
        const orderSession = this.activeOrders.get(chatId);
        
        if (orderSession && orderSession.step === 'confirming') {
            if (['כן', 'yes', 'אישור', 'אשר'].includes(input.toLowerCase())) {
                await this.confirmOrder(chatId, phoneNumber);
            } else if (['לא', 'no', 'ביטול', 'בטל'].includes(input.toLowerCase())) {
                await this.cancelOrder(chatId);
            }
        }
    }

    start() {
        console.log('Starting WhatsApp Pub Bot...');
        this.client.initialize();
    }

    stop() {
        console.log('Stopping WhatsApp Pub Bot...');
        this.client.destroy();
    }

    // Get bot status for admin panel
    getStatus() {
        return {
            isReady: this.client.info ? true : false,
            activeOrders: this.activeOrders.size,
            customerSessions: this.customerSessions.size,
            uptime: process.uptime()
        };
    }
}

module.exports = WhatsAppPubBot;
