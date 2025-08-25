#!/bin/bash

# ToPayThePub WhatsApp Bot Setup Script  
# Run this script on the REMOTE SERVER for test environment setup
# Note: This is designed for remote server development via SSH

echo "🍺 Setting up ToPayThePub WhatsApp Bot on Remote Server..."
echo "📡 Remote Server Development Mode Detected"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install existing dependencies
echo "📦 Installing existing project dependencies..."
npm install

# Install WhatsApp bot dependencies
echo "📱 Installing WhatsApp bot dependencies..."
npm install whatsapp-web.js qrcode-terminal

# Create WhatsApp module directory if it doesn't exist
echo "📁 Creating WhatsApp module directory..."
mkdir -p module/whatsapp

# Make sure the database functions are ready
echo "🗄️ Checking database setup..."
if [ ! -f "db.js" ]; then
    echo "❌ Database file (db.js) not found!"
    exit 1
fi

# Set up environment variables template if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "# WhatsApp Bot Configuration" >> .env
        echo "WHATSAPP_BOT_ENABLED=false" >> .env
        echo "WHATSAPP_SESSION_PATH=./whatsapp_session" >> .env
        echo "WHATSAPP_WEBHOOK_URL=your_webhook_url_here" >> .env
    fi
    echo "🔧 Please edit .env file with your WhatsApp configuration"
fi

# Check if WhatsApp bot file exists
if [ -f "module/whatsapp/whatsappBot.js" ]; then
    echo "✅ WhatsApp bot implementation found"
else
    echo "⚠️ WhatsApp bot implementation not found at module/whatsapp/whatsappBot.js"
    echo "Please make sure all files are properly synced from Git"
fi

# Display current status
echo ""
echo "📊 Current Setup Status:"
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo "✅ Project dependencies: Installed"
echo "✅ WhatsApp dependencies: Installed"

# Check if documentation files exist
echo ""
echo "📚 Documentation Status:"
if [ -f "ANALYSIS_AND_WHATSAPP_PLAN.md" ]; then
    echo "✅ Analysis and plan document found"
else
    echo "❌ Analysis document missing"
fi

if [ -f "WHATSAPP_IMPLEMENTATION_CHECKLIST.md" ]; then
    echo "✅ Implementation checklist found"
else
    echo "❌ Implementation checklist missing"
fi

# Display next steps
echo ""
echo "🚀 Next Steps for Remote Server Development:"
echo ""
echo "1. Create test environment copy if not exists:"
echo "   cp -r /var/www/apps/topaythepub /var/www/apps/topaythepub-test"
echo ""
echo "2. Set up separate test database:"
echo "   - Create topaythepub_test database"
echo "   - Update .env in test folder with test DB settings"
echo "   - Use different APP_PORT (e.g., 3001 for test, 3000 for prod)"
echo ""
echo "3. Configure WhatsApp for testing:"
echo "   - Use separate WhatsApp test number"
echo "   - Different session path for test environment"
echo ""
echo "4. Development workflow:"
echo "   ssh username@your-server.com"
echo "   cd /var/www/apps/topaythepub-test"
echo "   git checkout -b feature/whatsapp-bot"
echo "   # Make changes and test"
echo "   npm start  # Test on port 3001"
echo ""
echo "5. When ready for production:"
echo "   git checkout main"
echo "   git merge feature/whatsapp-bot"
echo "   cd /var/www/apps/topaythepub"
echo "   git pull origin main"
echo "   pm2 restart pub-prod"
echo ""
echo "� Remote Server Advantages:"
echo "✅ No file transfers needed between computers"
echo "✅ Consistent environment from any device"
echo "✅ Test and production on same server"
echo "✅ SSH access from anywhere"
echo "✅ Centralized development"
echo ""
echo "🔧 Pro Tip: Use VS Code Remote SSH extension for better experience!"
echo "   Connection: ssh://username@your-server.com"
echo ""
echo "✅ Setup complete! Ready to implement WhatsApp bot integration!"