# Aiven MySQL Setup Guide

## Prerequisites
- Aiven account (free tier available)
- MySQL Workbench installed

## Step 1: Create Aiven MySQL Service

1. Go to https://console.aiven.io
2. Click "Create Service"
3. Select "MySQL"
4. Choose:
   - Cloud: AWS/GCP/Azure (free tier eligible)
   - Region: Choose nearest to you
   - Plan: Free (or startup if available)
5. Name your service (e.g., `pet-adoption-db`)
6. Click "Create"

## Step 2: Get Connection Details

Wait for service to be "RUNNING", then:
1. Click on your MySQL service
2. Go to "Overview" tab
3. Find "Connection Information":
   ```
   Host: your-service-name-xxxx-xxxx.aivencloud.com
   Port: 3306
   User: avnadmin
   Password: xxxxxxxxxxxx
   ```

## Step 3: Connect via MySQL Workbench

1. Open MySQL Workbench
2. Click "+" to add new connection
3. Fill in:
   - Connection Name: Pet Adoption (or any name)
   - Hostname: (paste from Aiven)
   - Port: 3306
   - Username: avnadmin
   - Password: (paste from Aiven)
4. Click "Test Connection"
5. If successful, click "OK"

## Step 4: Update .env File

Update your local `.env` file:
```env
DB_HOST=your-service-name-xxxx-xxxx.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-password-from-aiven
DB_NAME=pet_adoption
```

## Step 5: Initialize Database

```bash
npm run init-db
```

This creates:
- Database: `pet_adoption`
- Tables: `users`, `pets`, `adoption_requests`
- Default admin user

## Step 6: Whitelist Render IPs (Production)

If deploying to Render:
1. In Aiven console, go to your service
2. Click "Users" tab
3. Select user (avnadmin)
4. Enable "Allow connections from anywhere" OR
5. Add Render static IPs to whitelist

Find Render IPs:
- Go to Render Dashboard -> Your Service -> Settings
- Look for "Dedicated Static Outbound IPs" or
- Use 0.0.0.0/0 for testing (not recommended for production)