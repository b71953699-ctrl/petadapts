# GitHub Setup Guide

## Step 1: Initialize Git Repository
```bash
cd pet-adoption-system
git init
git add .
git commit -m "Initial commit - Pet Adoption System"
```

## Step 2: Create GitHub Repository
Go to https://github.com/new and create a new repository named `pet-adoption-system`

## Step 3: Push to GitHub
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pet-adoption-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Connect to Render
1. Go to https://render.com and sign up/login
2. Click "New" -> "Blueprint" or "Web Service"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and configure automatically
5. Add environment variables in Render dashboard:
   - DB_HOST
   - DB_PORT
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
6. Deploy!

## Step 5: Setup Aiven MySQL
1. Go to https://aiven.io and create free MySQL account
2. Create new MySQL service
3. Copy connection details:
   - Host: from Service Overview
   - Port: 3306
   - User: avnadmin (or your created user)
   - Password: your password
4. Update Render environment variables with these values
5. Run database initialization locally or via Render shell

## Troubleshooting

### Database Connection Issues
- Ensure Aiven allows connections from Render IP
- In Aiven dashboard, go to your MySQL service -> Users -> check connection permissions

### Build Failures
- Check build logs in Render dashboard
- Ensure all environment variables are set