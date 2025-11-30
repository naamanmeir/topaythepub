# Future Plans & Roadmap

## 🗺️ Roadmap

### Short Term (This Week)
- [ ] **Integrate Refactored Routers**: Complete the switch for Client, Accountant, and Manage routers.
- [ ] **Refactor Remaining Routers**: Admin, MessageBoard, RemoteMessageBoard.
- [ ] **Testing**: Add unit and integration tests.

### Medium Term (Next Month)
- [ ] **WhatsApp Integration**: Implement the WhatsApp bot (see below).
- [ ] **Performance**: Add caching and rate limiting.
- [ ] **Observability**: Enhanced logging and metrics.

---

## 📱 WhatsApp Bot Implementation

**Goal**: Allow customers to order and check balances via WhatsApp.

### Prerequisites
- [ ] WhatsApp Business API account
- [ ] Meta Developer account
- [ ] SSL certificate
- [ ] Webhook URL

### Database Updates
```sql
ALTER TABLE clients ADD COLUMN phone VARCHAR(20) UNIQUE;
ALTER TABLE orders ADD COLUMN source ENUM('web', 'whatsapp') DEFAULT 'web';
CREATE INDEX idx_clients_phone ON clients(phone);
```

### Implementation Steps
1.  **Install Dependencies**: `npm install whatsapp-web.js qrcode-terminal`
2.  **Create Bot Class**: Implement `WhatsAppPubBot` in `module/whatsapp/`.
3.  **Handle Commands**:
    - `start` / `תפריט`: Main menu
    - `order` / `הזמנה`: Place order
    - `balance` / `חשבון`: Check balance
    - `help` / `עזרה`: Help menu

### File Structure
```
module/
  whatsapp/
    whatsappBot.js          # Main bot class
    messageHandlers.js      # Message processing
    orderManager.js         # Order session management
    customerService.js      # Customer operations
```
