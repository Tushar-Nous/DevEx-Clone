# Local Development Setup Script
# This script sets up the environment to use local API server

Write-Host "🔧 Setting up local development environment..." -ForegroundColor Cyan
Write-Host ""

# Create .env.local file for React app
$envContent = @"
# Local Development API Configuration
# Backend API is running on localhost:8080
REACT_APP_API_BASE_URL=http://localhost:8080
NODE_ENV=development
"@

$envPath = ".\NousAugmentedDevX_UI\.env.local"
Set-Content -Path $envPath -Value $envContent

Write-Host "✅ Created .env.local file with local API configuration" -ForegroundColor Green
Write-Host "   API Base URL: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""

# Display current configuration
Write-Host "📋 Current Setup:" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "🚀 To start testing:" -ForegroundColor Cyan
Write-Host "   1. Backend is already running on port 8080" -ForegroundColor White
Write-Host "   2. Start frontend: cd NousAugmentedDevX_UI && npm start" -ForegroundColor White
Write-Host "   3. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Check backend health: http://localhost:8080/health" -ForegroundColor White
Write-Host "   - View personas: http://localhost:8080/personas" -ForegroundColor White
Write-Host "   - Frontend will automatically use localhost:8080 in development mode" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup complete! Ready for local testing." -ForegroundColor Green
