# Digital Menu Card System

A modern, full-stack digital menu card application built with **Vue.js** and **Node.js/Express**. Perfect for restaurants, cafes, and food establishments to manage and display their menus digitally.

## Features

- 📱 Responsive web interface
- 🍽️ Easy menu management
- 🔍 Search and filter functionality
- 💳 Digital ordering system
- 🎨 Modern UI/UX design
- 🔐 Secure backend API
- 📊 Admin dashboard
- 🗄️ PostgreSQL database

## Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next generation build tool
- **CSS3** - Styling and responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication & authorization

## Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** v12 or higher
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sam414141/Digital-MenuCard.git
cd Digital-MenuCard
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env` and configure your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_menucard
DB_USER=postgres
DB_PASSWORD=your_strong_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

Create the database:

```bash
# Using PostgreSQL client or pgAdmin
createdb digital_menucard
```

Start the backend server:

```bash
npm start
```

Server will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

Edit `.env` if needed:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Digital Menu Card
```

Start the development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
Digital-MenuCard/
├── backend/
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Configuration files
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/          # Page views
│   │   ├── stores/         # State management
│   │   ├── services/       # API services
│   │   └── App.vue         # Root component
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── vite.config.js      # Vite configuration
├── README.md
└── .gitignore
```

## Available Scripts

### Backend

```bash
npm start          # Start the server
npm run dev        # Start with hot reload (if nodemon configured)
npm test           # Run tests
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

## API Documentation

The backend API endpoints are RESTful and follow standard conventions:

- `GET /api/menus` - Get all menus
- `POST /api/menus` - Create a new menu
- `GET /api/menus/:id` - Get menu by ID
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu

Authentication is required for most endpoints using JWT tokens.

## Environment Variables

### Backend `.env`
- `DB_HOST` - Database hostname
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret

### Frontend `.env`
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables on your hosting platform
2. Push to the platform's git remote
3. Platform will automatically install dependencies and run `npm start`

### Frontend (Vercel/Netlify/GitHub Pages)

1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or kill the process using the port
```

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure the database exists

### CORS Errors
- Check `VITE_API_URL` matches backend URL
- Verify backend CORS configuration

## License

This project is licensed under the MIT License – see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/Sam414141/Digital-MenuCard/issues).

## Author

**Sam414141** - [GitHub Profile](https://github.com/Sam414141)

---

**Happy coding!** 🚀
