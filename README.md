# Bible plan
A web application built with Laravel and Filamentphp.

## About
Helps users track and respond to daily readings from a yearly Bible plan.

## Requirements
- PHP >= 8.1
- Composer
- Node.js & NPM
- MySQL

## Installation
1. Clone the repository
   ```bash
   git clone https://github.com/MMenchuDev/bible-plan.git
   cd bible-plan

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
   DB_DATABASE=bible_plan
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   
5. Run migrations
    ```bash
   php artisan migrate:fresh --seed
   
6. Generate for all entities (Dar todos los permisos para super_admin role hasta hoy 15/04/25)
   ```bash
   php artisan shield:generate --all
   
7. Generate custom permissions
   ```bash
   php artisan db:seed --class=ShieldSeeder
  
7. Run the app in local
    ```bash
   php artisan serve
   
5. Open your on http://localhost:8000/admin 

7. For test purpose, You can use the 'mmenchu@reydereyestotonicapan.org' user and 'password' as the password.


## Features
- Roles and permissions
- Reading plan customization
- Daily reading tracker
- Progress statistics



## License
[MIT](LICENSE) `
