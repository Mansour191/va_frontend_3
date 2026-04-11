# Local MySQL Setup Script for VinylArt (No Docker)
Write-Host "🚀 Setting up Local MySQL for VinylArt (No Docker)" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if MySQL is already installed
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "mysql.exe"
)

$mysqlPath = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        break
    }
}

if ($mysqlPath) {
    Write-Host "✅ MySQL found at: $mysqlPath" -ForegroundColor Green
    
    # Test MySQL connection
    try {
        $testResult = & $mysqlPath -u root -pvinylart123 -e "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MySQL connection successful" -ForegroundColor Green
        } else {
            Write-Host "❌ MySQL connection failed - wrong password or service not running" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ MySQL connection failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MySQL not found. Please install MySQL first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation Options:" -ForegroundColor Cyan
    Write-Host "1. MySQL Community Server (Recommended)" -ForegroundColor White
    Write-Host "   Download from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Gray
    Write-Host "   - Choose 'Developer Default' setup" -ForegroundColor Gray
    Write-Host "   - Set root password to: vinylart123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. XAMPP (Easier for beginners)" -ForegroundColor White
    Write-Host "   Download from: https://www.apachefriends.org/download.html" -ForegroundColor Gray
    Write-Host "   - Install with MySQL + phpMyAdmin" -ForegroundColor Gray
    Write-Host "   - Start MySQL from XAMPP Control Panel" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if MySQL service is running
$serviceName = "MySQL80"
if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    $service = Get-Service -Name $serviceName
    if ($service.Status -eq "Running") {
        Write-Host "✅ MySQL service is running" -ForegroundColor Green
    } else {
        Write-Host "🔄 Starting MySQL service..." -ForegroundColor Yellow
        Start-Service -Name $serviceName
        Start-Sleep -Seconds 5
        $service.Refresh()
        if ($service.Status -eq "Running") {
            Write-Host "✅ MySQL service started successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to start MySQL service" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "❌ MySQL service not found" -ForegroundColor Red
    Write-Host "Please check your MySQL installation" -ForegroundColor Yellow
    exit 1
}

# Create database and user
Write-Host "📝 Setting up database and user..." -ForegroundColor Yellow

# Test root connection
try {
    $testResult = & $mysqlPath -u root -pvinylart123 -e "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Root connection successful" -ForegroundColor Green
        
        # Create database
        Write-Host "🗄️  Creating database 'vinylart'..." -ForegroundColor Yellow
        $createDbCmd = "& '$mysqlPath' -u root -pvinylart123 -e `"CREATE DATABASE IF NOT EXISTS vinylart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`""
        Invoke-Expression $createDbCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database 'vinylart' created successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create database" -ForegroundColor Red
        }
        
        # Create user
        Write-Host "👤 Creating user 'vinylart_user'..." -ForegroundColor Yellow
        $createUserCmd = "& '$mysqlPath' -u root -pvinylart123 -e `"CREATE USER IF NOT EXISTS 'vinylart_user'@'localhost' IDENTIFIED BY 'vinylart123';`""
        Invoke-Expression $createUserCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ User 'vinylart_user' created successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create user" -ForegroundColor Red
        }
        
        # Grant privileges
        Write-Host "🔐 Granting privileges..." -ForegroundColor Yellow
        $grantCmd = "& '$mysqlPath' -u root -pvinylart123 -e `"GRANT ALL PRIVILEGES ON vinylart.* TO 'vinylart_user'@'localhost';`""
        Invoke-Expression $grantCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Privileges granted successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to grant privileges" -ForegroundColor Red
        }
        
        # Flush privileges
        Write-Host "🔄 Flushing privileges..." -ForegroundColor Yellow
        $flushCmd = "& '$mysqlPath' -u root -pvinylart123 -e `"FLUSH PRIVILEGES;`""
        Invoke-Expression $flushCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Privileges flushed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to flush privileges" -ForegroundColor Red
        }
        
        # Test user connection
        Write-Host "🔍 Testing user connection..." -ForegroundColor Yellow
        $testUserCmd = "& '$mysqlPath' -u vinylart_user -pvinylart123 -e `"USE vinylart; SELECT 'Connection successful' as message;`""
        $userTestResult = Invoke-Expression $testUserCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ User connection successful" -ForegroundColor Green
        } else {
            Write-Host "❌ User connection failed" -ForegroundColor Red
        }
        
        # Show tables
        Write-Host "📋 Showing database info..." -ForegroundColor Yellow
        $showTablesCmd = "& '$mysqlPath' -u vinylart_user -pvinylart123 -e `"SHOW TABLES;`" vinylart
        $tablesResult = Invoke-Expression $showTablesCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "📊 Current tables in vinylart database:" -ForegroundColor Cyan
            if ($tablesResult) {
                $tablesResult | ForEach-Object { if ($_ -match "Tables_in_vinylart") { Write-Host "  📁 $_" -ForegroundColor White } }
            } else {
                Write-Host "  📁 No tables yet (will be created by Django migrations)" -ForegroundColor Gray
            }
        }
        
    } else {
        Write-Host "❌ Failed to connect to MySQL with root user" -ForegroundColor Red
        Write-Host "Please check if MySQL is running and root password is 'vinylart123'" -ForegroundColor Yellow
        Write-Host "Try: mysql -u root -p" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ Error connecting to MySQL: $_" -ForegroundColor Red
    exit 1
}

# Install mysqlclient
Write-Host "📦 Installing mysqlclient..." -ForegroundColor Yellow

# Check if conda is available
try {
    $condaVersion = conda --version 2>$null
    if ($condaVersion) {
        Write-Host "✅ Conda found: $condaVersion" -ForegroundColor Green
        Write-Host "🔧 Installing mysqlclient with conda..." -ForegroundColor Yellow
        
        # Install mysqlclient with conda
        conda install mysqlclient -y
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ mysqlclient installed successfully with conda" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install mysqlclient with conda" -ForegroundColor Red
            Write-Host "🔄 Trying with pip..." -ForegroundColor Yellow
            
            # Try with pip
            pip install mysqlclient==2.2.4
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ mysqlclient installed successfully with pip" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to install mysqlclient with pip" -ForegroundColor Red
                Write-Host "Please install Visual C++ Build Tools and try again" -ForegroundColor Yellow
                Write-Host "Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Cyan
                exit 1
            }
        }
    }
} catch {
    Write-Host "⚠️  Conda not found, trying with pip..." -ForegroundColor Yellow
    
    # Try with pip
    pip install mysqlclient==2.2.4
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ mysqlclient installed successfully with pip" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install mysqlclient with pip" -ForegroundColor Red
        Write-Host "Please install Visual C++ Build Tools and try again" -ForegroundColor Yellow
        Write-Host "Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Cyan
        exit 1
    }
}

# Update .env file
Write-Host "⚙️  Updating .env file..." -ForegroundColor Yellow

$envContent = @"
# Database Configuration (Local MySQL)
DB_NAME=vinylart
DB_USER=vinylart_user
DB_PASSWORD=vinylart123
DB_HOST=localhost
DB_PORT=3306

# Django Configuration
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=django_secret_key_change_in_production_123
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "✅ .env file updated" -ForegroundColor Green

# Test Django configuration
Write-Host "🔍 Testing Django configuration..." -ForegroundColor Yellow

# Change to backend directory
Set-Location -Path "backend"

try {
    $djangoCheck = python manage.py check 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Django configuration is valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Django configuration check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error checking Django configuration: $_" -ForegroundColor Red
}

# Go back to project root
Set-Location -Path ".."

Write-Host ""
Write-Host "🎉 Local MySQL setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd backend" -ForegroundColor White
Write-Host "2. venv\Scripts\activate" -ForegroundColor White
Write-Host "3. python manage.py migrate" -ForegroundColor White
Write-Host "4. python manage.py createsuperuser" -ForegroundColor White
Write-Host "5. python manage.py runserver" -ForegroundColor White
Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "- Host: localhost" -ForegroundColor White
Write-Host "- Port: 3306" -ForegroundColor White
Write-Host "- Database: vinylart" -ForegroundColor White
Write-Host "- User: vinylart_user" -ForegroundColor White
Write-Host "- Password: vinylart123" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "- Access MySQL: mysql -u vinylart_user -pvinylart123 vinylart" -ForegroundColor White
Write-Host "- Start service: net start mysql80" -ForegroundColor White
Write-Host "- Stop service: net stop mysql80" -ForegroundColor White
Write-Host "- Check service: Get-Service MySQL80" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your VinylArt project is now ready with local MySQL!" -ForegroundColor Green
