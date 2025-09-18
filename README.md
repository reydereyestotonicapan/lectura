<div align="center">
  <img src="public/images/CROW.svg" alt="CROW Logo" width="200">
  <h1>Church CRM</h1>
  <p><em>Built with Filament and MYSQL</em></p>
</div>

## ℹ️ About
Church Customer Relationship Management with Filament and MYSQL helps church to manage and analyze interactions with current and potential members.

## 🌟 Features
- User login and registration
- Role-based access control
- Inventory management for church resources
- Admin dashboard for managing users and content
- Daily Bible reading plans
- Progress tracking and statistics
- Responsive design for mobile and desktop
- Email notifications for reminders and updates


## 🔧 Tech requirements
- PHP >= 8.1
- Composer >= 2.6.5
- Node.js >= 22.9.0 
- NPM >= 10.8.3
- MySQL >= 8.0

## 📋 Installation steps
1. Clone the repository
   ```bash
   git clone https://github.com/xoyon-dev/church-crm.git
   cd church-crm

2. Install dependencies 
   ```bash
   composer install 
   npm install
   
3. Set up environment
   ```bash
   cp .env.example .env
   php artisan key:generate
   
4. Configure database in .env file
    ```bash
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=church_crm
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   
5. Run migrations
    ```bash
   php artisan migrate:fresh --seed
   
6. If you want to update current roles or permissions
   ```bash
   php artisan db:seed --class=PermissionSeeder
   
7. Run the app in local
   ```bash
   php artisan serve
  
8. Open your on http://localhost:8000

9. For test purpose, You can use the 'mmenchu@reydereyestotonicapan.org' user and 'password' as the password.


## 💻 Tech Features
- Filament Shield for Roles and permissions


## License
[MIT](LICENSE) `
