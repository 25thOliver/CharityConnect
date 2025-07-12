# Charity Donation Platform

A full-stack web application for managing charity campaigns and donations.

## Project Structure

- `charity-backend/` - Django REST API backend
- `charity-frontend/` - React frontend application

## Prerequisites

Make sure you have the following installed:
- Python 3.8+
- Node.js 16+
- npm or yarn

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd charity-backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   python3 manage.py migrate
   ```

4. **Start the Django server:**
   ```bash
   # Option 1: Use the convenience script
   ./start_server.sh
   
   # Option 2: Manual start with environment variables
   DEBUG=True python3 manage.py runserver
   ```

   The backend will be available at: http://127.0.0.1:8000/

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd charity-frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   The frontend will be available at: http://localhost:3000/

## Running the Application

1. **Start the backend first** (in one terminal):
   ```bash
   cd charity-backend
   ./start_server.sh
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd charity-frontend
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000/
   - Backend API: http://127.0.0.1:8000/api/

## API Endpoints

- `GET /api/campaigns/` - List all campaigns
- `GET /api/campaigns/{id}/` - Get campaign details
- `POST /api/token/` - User authentication
- `POST /api/donations/` - Make a donation
- `GET /api/my-donations/` - Get user's donations

## Troubleshooting

### Backend Issues

- **Port already in use:** Kill existing processes with `pkill -f "manage.py runserver"`
- **Missing dependencies:** Run `pip install python-decouple whitenoise`
- **Database issues:** Run `python3 manage.py migrate`

### Frontend Issues

- **Port already in use:** The React dev server will automatically suggest an alternative port
- **API connection issues:** Make sure the backend is running on http://127.0.0.1:8000/

## Development Notes

- The backend uses Django REST Framework with JWT authentication
- The frontend uses React with TypeScript
- CORS is configured to allow frontend-backend communication
- Static files are served using WhiteNoise 