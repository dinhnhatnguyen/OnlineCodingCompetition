# Online Coding Competition System (OCCS)

<div align="center">

**Language / Ngôn ngữ:**
[🇺🇸 English](README_EN.md) | [🇻🇳 Tiếng Việt](README.md)

</div>

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)

## Project Overview

**Online Coding Competition System (OCCS)** is a comprehensive online programming competition platform designed to organize coding contests, manage programming problems, and evaluate users' coding skills. The system provides a secure environment for code execution with multiple programming languages and integrates AI for automatic test case generation and personalized problem recommendations.

### Objectives
- Create a professional and user-friendly programming competition platform
- Support programming education through diverse problem sets
- Provide efficient contest management tools for instructors/admins
- Integrate AI to enhance learning experience

### Significance
The project contributes to the digitization of programming education, facilitating the organization of online coding competitions in a professional and efficient manner.

## Key Features

### For Users
- **Authentication & Authorization**: Registration, login with JWT, profile management
- **Problem Solving**: Code editor with Monaco Editor integration and syntax highlighting
- **Code Execution**: Support for multiple languages (Java, Python, C++, JavaScript...)
- **Contest Participation**: Register and participate in real-time contests
- **Progress Tracking**: View submission history and detailed results
- **AI Recommendations**: Personalized problem recommendation system
- **Interaction**: Comment and report problem issues
- **Multi-language**: Vietnamese/English interface support

### For Admin/Instructors
- **Problem Management**: Create, edit, delete problems with WYSIWYG editor
- **Test Case Management**: Auto-generate test cases with AI or add manually
- **Contest Management**: Create contests, set schedules, manage participants
- **User Management**: View user lists, assign permissions, statistics
- **Reports & Analytics**: Dashboard with important metrics
- **System Configuration**: Manage programming languages, scoring settings

### Security & Performance
- **Secure Sandbox**: Code execution in isolated Docker containers
- **Performance Optimization**: Caching, connection pooling, resource limits
- **Security**: Input validation, SQL injection prevention, rate limiting
- **Monitoring**: Health checks, logging, error tracking

## Technology Stack & Architecture

### Backend Technologies
- **Java 17** - Core programming language
- **Spring Boot 3.4.4** - Main framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database ORM
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Docker Java API** - Code execution in containers
- **AWS SQS** - Message queuing service
- **Google Cloud Translate** - Multi-language support

### Frontend Technologies
- **React 19.1.0** - UI framework
- **Ant Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Code editor (VS Code engine)
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Firebase** - Additional services integration

### AI & Recommendation System
- **Python 3.9+** - AI service language
- **FastAPI** - High-performance API framework
- **LiteLLM** - LLM integration
- **Scikit-learn** - Machine learning algorithms
- **Neo4j** - Graph database for recommendations
- **Pandas** - Data manipulation

### Database & Infrastructure
- **PostgreSQL** - Primary database
- **H2 Database** - Development/testing
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **AWS EC2** - Cloud deployment

### System Architecture
![System Architecture](System_architech.png)

*System architecture includes Frontend (React), Backend API (Spring Boot), AI Service (FastAPI), and Database (PostgreSQL) deployed on Docker containers.*

## Installation & Setup Guide

### System Requirements
- **Docker** and **Docker Compose** (latest version)
- **Java 17+** (for local development)
- **Node.js 18+** (for local development)
- **Python 3.9+** (for local development)
- **Git**

### Docker Installation (Recommended)

#### 1. Clone repository
```bash
git clone <repository-url>
cd OnlineCodingCompetition
```

#### 2. Configure environment variables
```bash
# Copy and edit .env file
cp .env.example .env
nano .env

# Configure recommendation system
cp RecommendationSystem/.env.example RecommendationSystem/.env
nano RecommendationSystem/.env
```

#### 3. Build and run the entire system
```bash
# Build all services
docker-compose -f deploy/docker-compose.prod.yml build

# Run the system
docker-compose -f deploy/docker-compose.prod.yml up -d

# Check services status
docker-compose -f deploy/docker-compose.prod.yml ps
```

#### 4. Initialize database (first time)
```bash
# Import database schema
docker-compose -f deploy/docker-compose.prod.yml exec postgres psql -U occs_user -d occs_db -f /docker-entrypoint-initdb.d/init.sql
```

### Local Development Setup

#### Backend (Spring Boot)
```bash
cd onlineCodingCompetition

# Install dependencies
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Or with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend (React)
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

#### AI Service (Python)
```bash
cd RecommendationSystem

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

### Advanced Configuration

#### Database Configuration
```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://occs_user:password@localhost:5432/occs_db

# H2 Database (for development)
spring.datasource.url=jdbc:h2:mem:testdb
```

#### Docker Configuration
```bash
# Customize resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.8'
```

## Project Structure

```
OnlineCodingCompetition/
├── frontend/                     # React Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── contexts/            # React contexts (Auth, Theme, etc.)
│   │   ├── api/                 # API service functions
│   │   └── utils/               # Utility functions
│   ├── Dockerfile               # Frontend container config
│   ├── nginx.conf               # Nginx configuration
│   └── package.json             # Node.js dependencies
│
├── onlineCodingCompetition/      # Spring Boot Backend
│   ├── src/main/java/oj/onlineCodingCompetition/
│   │   ├── controller/          # REST API controllers
│   │   ├── service/             # Business logic services
│   │   ├── repository/          # Data access layer
│   │   ├── model/               # Entity models
│   │   ├── security/            # Authentication & authorization
│   │   └── config/              # Configuration classes
│   ├── Dockerfile               # Backend container config
│   ├── pom.xml                  # Maven dependencies
│   └── docker-compose.yml       # Local development setup
│
├── RecommendationSystem/         # Python AI Service
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── recommendation.py    # Recommendation algorithms
│   │   └── automation_testcase.py # AI test case generation
│   ├── dataset/                 # Training data
│   ├── Dockerfile               # AI service container config
│   └── requirements.txt         # Python dependencies
│
├── deploy/                       # Deployment configurations
│   ├── docker-compose.prod.yml  # Production deployment
│   ├── build.sh                 # Build automation script
│   ├── ec2-setup.sh             # AWS EC2 setup script
│   └── DEPLOYMENT.md            # Deployment guide
│
├── docs/                         # Documentation
│   ├── README.md                # Vietnamese version
│   ├── README_EN.md             # English version (this file)
│   └── System_architech.png     # System architecture diagram
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── TODOS.md                      # Development roadmap
└── docker-compose.yml            # Development setup
```

### Main Directory Roles:

- **`frontend/`**: React application with modern user interface
- **`onlineCodingCompetition/`**: Backend API handling business logic
- **`RecommendationSystem/`**: AI service for recommendations and automation
- **`deploy/`**: Scripts and configs for production deployment
- **`docs/`**: Project documentation and guides

## Demo

### Screenshots & Videos
*[Placeholder - Add screenshots of main features]*

- Admin dashboard with overview statistics
- Problem solving interface with code editor
- Contest management page
- AI recommendation system

### Live Demo
*[Placeholder - Link to online demo if available]*

```bash
# To run local demo after installation:
# 1. Access main application
open http://localhost

# 2. API Documentation (Swagger)
open http://localhost:8080/swagger-ui.html

# 3. AI Service API
open http://localhost:3000/docs
```

### Test Data
```bash
# Import sample data for testing
docker-compose -f deploy/docker-compose.prod.yml exec backend java -jar app.jar --import-sample-data

# Or use existing script
./deploy/import-sample-data.sh
```

## Roadmap / Future Development

### Short-term (1-3 months)
- [ ] **Performance Optimization**: Redis caching, database query optimization
- [ ] **Language Expansion**: Add support for Rust, Go, Kotlin
- [ ] **Mobile Responsive**: Improve interface on mobile devices
- [ ] **Real-time Features**: WebSocket for live contest updates
- [ ] **Advanced Analytics**: Detailed performance statistics

### Medium-term (3-6 months)
- [ ] **Microservices Architecture**: Split into independent services
- [ ] **Advanced AI Features**: 
  - Plagiarism detection
  - Code quality analysis
  - Intelligent hints system
- [ ] **Collaborative Features**: Team contests, pair programming
- [ ] **Advanced Security**: Rate limiting, DDoS protection
- [ ] **Multi-tenant Support**: Support for multiple organizations

### Long-term (6+ months)
- [ ] **Cloud-native Deployment**: Kubernetes, auto-scaling
- [ ] **Advanced ML Models**: Personalized learning paths
- [ ] **Integration Ecosystem**: LMS integration, GitHub sync
- [ ] **Mobile Applications**: Native iOS/Android apps
- [ ] **Enterprise Features**: SSO, advanced reporting, audit logs

### Expansion Ideas
- **Gamification**: Badges, leaderboards, achievements
- **Learning Paths**: Structured curriculum with AI guidance
- **Community Features**: Forums, peer review, mentoring
- **Advanced Analytics**: ML-powered insights for educators
- **Global Competitions**: Multi-region contests with ranking

## Contributing

### How to Contribute
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

### Coding Standards
- **Java**: Follow Google Java Style Guide
- **JavaScript/React**: ESLint + Prettier configuration
- **Python**: PEP 8 compliance
- **Git**: Conventional Commits format

### Bug Reports
Use GitHub Issues with template:
- **Bug description**: Detailed error description
- **Steps to reproduce**: Reproduction steps
- **Expected vs Actual**: Expected vs actual results
- **Environment**: OS, browser, version info

## Contact Information

### Development Team
- **Project Lead**: [Your Name]
  - Email: [your-email@example.com]
  - GitHub: [your-github-username]
  - LinkedIn: [your-linkedin-profile]

### Links
- **Website**: [project-website-url]
- **Documentation**: [docs-url]
- **Issues**: [github-issues-url]
- **Discussions**: [github-discussions-url]

### Support
- **Wiki**: See detailed documentation
- **Discord/Slack**: [community-chat-link]
- **Email Support**: [support-email]

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Spring Boot Team** - Excellent framework for Java development
- **React Team** - Amazing frontend library
- **Docker** - Containerization made easy
- **Open Source Community** - For all the amazing libraries and tools

---

<div align="center">

**⭐ If this project is helpful, please give us a star! ⭐**

Made with ❤️ by [Your Team Name]

</div>