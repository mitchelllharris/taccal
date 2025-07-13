# Asphalt Calculator Backend

A Node.js/Express backend API for the Asphalt Quote Calculator application. This backend provides REST API endpoints for saving, searching, and managing quotes.

## Features

- **RESTful API** for quote management
- **MongoDB Atlas** integration for data persistence
- **Search functionality** by client name, quote number, service type
- **Pagination** for large datasets
- **Input validation** and error handling
- **Rate limiting** for API protection
- **CORS support** for frontend integration
- **Production-ready** with environment configuration

## API Endpoints

### Quotes
- `GET /api/quotes` - Get all quotes (with search, pagination, sorting)
- `GET /api/quotes/:id` - Get a specific quote
- `POST /api/quotes` - Create a new quote
- `PUT /api/quotes/:id` - Update a quote
- `DELETE /api/quotes/:id` - Delete a quote

### Statistics
- `GET /api/quotes/stats/summary` - Get summary statistics

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account and cluster
3. Create a database user (username/password)
4. Add your IP to the access list (or use `0.0.0.0/0` for development)
5. Get your connection string

### 3. Environment Configuration
1. Copy `env.example` to `.env`
2. Update the MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/asphalt-calculator?retryWrites=true&w=majority
```

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### 5. Test the API
```bash
# Health check
curl http://localhost:3000/health

# Get all quotes
curl http://localhost:3000/api/quotes

# Search quotes
curl "http://localhost:3000/api/quotes?search=smith"
```

## Development

### Project Structure
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── models/
│   └── Quote.js      # MongoDB schema
├── routes/
│   └── quotes.js     # API routes
└── env.example       # Environment variables template
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm test` - Run tests (to be implemented)

## API Documentation

### Create a Quote
```javascript
POST /api/quotes
Content-Type: application/json

{
  "clientInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Brisbane",
    "postcode": "4000"
  },
  "projectInfo": {
    "quoteNumber": "Q-123456"
  },
  "serviceInfo": {
    "type": "Overlay"
  },
  "materials": {
    "asphalt": {
      "area": 100,
      "depth": 50
    }
  }
  // ... other fields
}
```

### Search Quotes
```javascript
GET /api/quotes?search=john&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Response Format
```javascript
{
  "success": true,
  "data": [...quotes],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Deployment

### Render (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy!

### Railway
1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy automatically

### Heroku
1. Create a Heroku app
2. Add MongoDB Atlas addon
3. Deploy with Git

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `FRONTEND_URL` | Frontend URL for CORS | Optional |

## Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** with Mongoose
- **CORS configuration** for frontend access
- **Error handling** with proper HTTP status codes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 