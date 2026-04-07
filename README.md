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


## 🐳 Local development with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. Build and start the containers
   ```bash
   docker compose up --build
   ```

2. Run migrations and seeders
   ```bash
   docker compose exec app php artisan migrate --seed
   ```

3. Open the app on http://localhost:8000

**Other useful commands**

```bash
# Stop containers (keep data)
docker compose stop

# Stop and remove containers + volumes (wipe DB)
docker compose down -v

# Tail Laravel logs
docker compose exec app tail -f storage/logs/laravel.log

# Open a shell inside the app container
docker compose exec app sh
```

The PostgreSQL database is also available on your host at `localhost:5432` (user: `lectura`, password: `secret`, db: `lectura`), so you can connect with any SQL client.

### Syncing production data to stage

To keep your stage environment up to date with production data, add the Railway public connection URLs to your `.env`:

```env
PROD_DB_URL=postgresql://postgres:<password>@your-db-prod-host:post/database
STAGE_DB_URL=postgresql://postgres:<password>@your-db-stage-host:port/database
```

Then run:

```bash
php artisan db:sync-from-prod
```

This copies only new records from prod to stage — it never overwrites or deletes existing data.

---

## 💻 Tech Features
- Filament Shield for Roles and permissions


## License
[MIT](LICENSE) `

---

## Firebase Setup (Mobile API)

### 1. Download the service account JSON

Go to **Firebase Console → Project Settings → Service accounts → Generate new private key** and download the JSON file.

Place it at:

```
storage/app/firebase/service-account.json
```

### 2. Configure environment variables

In your `.env` file:

```env
FIREBASE_CREDENTIALS=storage/app/firebase/service-account.json
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 3. Enable Email/Password sign-in (for local testing only)

In Firebase Console → **Authentication → Sign-in method → Email/Password** → enable it.

Then create a test user under **Authentication → Users → Add user**.

---

## API Testing

### Get a Firebase ID token (test only)

```bash
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_WEB_API_KEY" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"yourpassword","returnSecureToken":true}'
```

Copy the `idToken` from the response.

> Your **Web API Key** can be found in Firebase Console → Project Settings → General → Your apps → Firebase SDK snippet (`apiKey` field).

### Authenticate against the API

```bash
curl -X POST http://localhost:8000/api/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{"firebase_token":"PASTE_ID_TOKEN_HERE"}'
```

A successful response returns a Sanctum token:

```json
{
  "token": "sanctum-token-here",
  "user": { "id": 1, "name": "...", "email": "..." }
}
```

### Get a Sanctum token for an existing user (bypass Firebase)

Useful for quickly testing protected endpoints without going through Firebase.

```bash
docker compose exec app php artisan tinker
```

```php
$user = \App\Models\User::first(); // or ->find(id)
echo $user->createToken('test')->plainTextToken;
```

### Call a protected endpoint

```bash
curl http://localhost:8000/api/hello \
  -H "Authorization: Bearer YOUR_SANCTUM_TOKEN"
```

### Available API endpoints

All endpoints below require a valid `Authorization: Bearer` token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/firebase-login` | Exchange Firebase ID token for Sanctum token |
| `GET` | `/api/readings/today` | Get today's reading |
| `GET` | `/api/readings` | Get paginated list of readings |
| `GET` | `/api/readings/{id}` | Get a specific reading with questions and answers |
| `GET` | `/api/readings/{id}/questions` | Get questions for a reading |
| `POST` | `/api/readings/{id}/answers` | Submit quiz answers |
| `GET` | `/api/profile` | Get authenticated user's profile |
