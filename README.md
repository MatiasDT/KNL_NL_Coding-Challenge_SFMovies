# 🎬 KNL_NL_Coding-Challenge_SFMovies

A modern web application that visualizes filming locations of movies shot in San Francisco using interactive maps. Built with Angular 19 and .NET 9, featuring real-time data from the San Francisco government's open data API.

## 🌟 Features

- Interactive Mapbox visualization of movie filming locations
- Real-time data from San Francisco's open data API  
- Modern responsive design with Tailwind CSS and DaisyUI
- Full TypeScript implementation with Angular 19
- .NET 9 Web API backend with comprehensive testing
- Docker containerization support

## 🛠️ Tech Stack

**Frontend:** Angular 19, TypeScript 5.7, Mapbox GL JS, Tailwind CSS, DaisyUI  
**Backend:** .NET 9, ASP.NET Core Web API  
**Testing:** Karma/Jasmine (Frontend), xUnit (Backend)  
**Deployment:** Docker, Docker Compose

## 🚀 Development Setup

### Prerequisites

- Node.js (v18 or higher)
- .NET 9 SDK
- [Mapbox access token](https://www.mapbox.com/help/how-access-tokens-work/)
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   cd knl_nl_coding-challenge_sfmovies.client
   npm install
   ```

3. **Configure Mapbox Token**

   This project uses Mapbox SDK for interactive maps. You need to configure a personal access token:

   - How to get a Mapbox token: https://www.mapbox.com/help/how-access-tokens-work/
   - Set the `mapboxToken` variable in the `environment.development.ts` file:
   
   ```typescript
   // knl_nl_coding-challenge_sfmovies.client/src/environments/environment.development.ts
   export const environment = {
     production: false,
     mapboxToken: 'YOUR_MAPBOX_TOKEN_HERE'
   };
   ```

### Running the Application

#### Option 1: Visual Studio (Recommended)
- Press `Ctrl + F5` in Visual Studio, or 
- Run:
  ```bash
  dotnet run --project KNL_NL_Coding-Challenge_SFMovies.Server
  ```

Once the server is running, open your browser and navigate to `https://localhost:53929/`. The application will automatically reload whenever you modify any of the source files.

#### Option 2: Separate Frontend/Backend
Start the backend:
```bash
cd KNL_NL_Coding-Challenge_SFMovies.Server
dotnet run
```

Start the frontend (in a new terminal):
```bash
cd knl_nl_coding-challenge_sfmovies.client  
npm start
```

Access the application at `https://localhost:4200`

## 🐳 Docker Deployment

1. **Set the production Mapbox token** in the `environment.ts` file:
   ```typescript
   // knl_nl_coding-challenge_sfmovies.client/src/environments/environment.ts
   export const environment = {
     production: true,
     mapboxToken: 'YOUR_MAPBOX_TOKEN_HERE'
   };
   ```

2. **Deploy with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

Once the containers are running, open your browser and navigate to `http://localhost:4200/`.

## 🧪 Testing

Run frontend tests:
```bash
cd knl_nl_coding-challenge_sfmovies.client
npm test
```

Run backend tests:
```bash
cd KNL_NL_Coding-Challenge_SFMovies.Server.Tests
dotnet test
```

Run all tests from solution root:
```bash
dotnet test
```

## 📁 Project Structure

```
KNL_NL_Coding-Challenge_SFMovies/
├── KNL_NL_Coding-Challenge_SFMovies.Server/        # .NET 9 Web API
│   ├── Controllers/                                # API Controllers  
│   ├── Services/FilmLocationsSanFrancisco/         # Business Logic
│   └── Program.cs                                  # Application Entry Point
├── KNL_NL_Coding-Challenge_SFMovies.Server.Tests/  # Backend Tests
├── knl_nl_coding-challenge_sfmovies.client/        # Angular 19 Application
│   ├── src/app/                                    # Components & Services
│   └── src/environments/                           # Environment Configuration
└── docker-compose.yml                              # Docker Orchestration
```

## 🚨 Troubleshooting

**Common Issues:**

| Problem | Solution |
|---------|----------|
| Mapbox map not loading | Ensure your Mapbox token is correctly set in the environment files |
| API data not fetching | Check internet connection and browser console for errors |
| Docker build fails | Make sure to set the Mapbox token in the production environment.ts file |
| CORS errors | Verify both frontend and backend are running on the expected ports |
| Port already in use | Kill existing processes or change ports in configuration |

## 🔧 Configuration

The application connects to:
- **San Francisco Open Data API:** `https://data.sfgov.org/resource/yitu-d5am.json`
- **Mapbox GL JS** for interactive map visualization

**Environment Variables:**
- `mapboxToken`: Required for map functionality
- `ASPNETCORE_ENVIRONMENT`: Development/Production  
- `NODE_ENV`: Node.js environment setting

## 🌐 API Endpoints

- `GET /FilmLocationsSanFrancisco` - Retrieves all filming locations
- `GET /swagger` - API documentation (Development only)

## 🤝 Contributing

This project follows modern development practices:
- Clean architecture with separation of concerns
- Comprehensive unit testing (frontend and backend)
- TypeScript for type safety
- Responsive design principles
- Docker containerization

## 📄 License

This project is part of a coding challenge and is for educational purposes.

---

**Built with ❤️ for the San Francisco Movies Coding Challenge**
