# 🐾 Pet Adoption System

A full-stack pet adoption platform with Admin, Shelter Staff, and Adopter roles.

## Features

### Roles
- **Admin**: Manages users, pets, and views reports
- **Shelter Staff**: Adds/updates pets, approves/rejects adoption requests
- **Adopter**: Searches pets, submits adoption requests, views adoption status

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: MySQL (Aiven Cloud)
- **Authentication**: JWT
- **Deployment**: Render

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your values:
```env
PORT=3000
NODE_ENV=development
DB_HOST=your-aiven-host
DB_PORT=3306
DB_USER=your-aiven-user
DB_PASSWORD=your-aiven-password
DB_NAME=pet_adoption
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start Development Server
```bash
npm run dev
```

## Default Admin Account
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new adopter |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Pets (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pets` | Search/list pets |
| GET | `/api/pets/:id` | Get pet details |
| GET | `/api/pets/meta/types` | Get pet types |

### Adoptions
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/adoptions` | Adopter | Submit request |
| GET | `/api/adoptions/my-requests` | Adopter | View my requests |
| DELETE | `/api/adoptions/:id` | Adopter | Cancel request |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/reports` | View reports |

### Staff Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/staff/pets` | Add pet |
| PUT | `/api/staff/pets/:id` | Update pet |
| DELETE | `/api/staff/pets/:id` | Delete pet |
| GET | `/api/staff/adoption-requests` | View requests |
| POST | `/api/staff/adoption-requests/:id/approve` | Approve |
| POST | `/api/staff/adoption-requests/:id/reject` | Reject |

## Deploy to Render

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env`

## Deploy to Aiven MySQL

1. Create Aiven MySQL service
2. Get connection details from Overview tab
3. Update `.env` with Aiven credentials
4. Run `npm run init-db`

## License

MIT