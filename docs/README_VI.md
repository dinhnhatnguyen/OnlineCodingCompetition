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

## Giới thiệu dự án

**Online Coding Competition System (OCCS)** là một nền tảng thi lập trình trực tuyến toàn diện, được thiết kế để tổ chức các cuộc thi lập trình, quản lý bài tập và đánh giá kỹ năng coding của người dùng. Hệ thống cung cấp môi trường an toàn để thực thi code với nhiều ngôn ngữ lập trình khác nhau, tích hợp AI để tự động tạo test case và gợi ý bài tập phù hợp.

### Mục tiêu

- Tạo ra một nền tảng thi lập trình chuyên nghiệp và dễ sử dụng
- Hỗ trợ giáo dục lập trình thông qua hệ thống bài tập đa dạng
- Cung cấp công cụ quản lý cuộc thi hiệu quả cho giảng viên/admin
- Tích hợp AI để nâng cao trải nghiệm học tập

### Ý nghĩa

Dự án góp phần vào việc số hóa giáo dục lập trình, tạo điều kiện cho việc tổ chức các cuộc thi coding online một cách chuyên nghiệp và hiệu quả.

## Tính năng chính

### Dành cho người dùng

- **Xác thực & Phân quyền**: Đăng ký, đăng nhập với JWT, quản lý profile
- **Giải bài tập**: Code editor tích hợp Monaco Editor với syntax highlighting
- **Thực thi code**: Hỗ trợ nhiều ngôn ngữ (Java, Python, C++, JavaScript...)
- **Tham gia cuộc thi**: Đăng ký và tham gia các contest theo thời gian thực
- **Theo dõi tiến độ**: Xem lịch sử submission, kết quả chi tiết
- **Gợi ý AI**: Hệ thống recommendation bài tập phù hợp với trình độ
- **Tương tác**: Comment, báo cáo lỗi bài tập
- **Đa ngôn ngữ**: Hỗ trợ giao diện tiếng Việt/Anh

### Dành cho Admin/Giảng viên

- **Quản lý bài tập**: Tạo, chỉnh sửa, xóa bài tập với editor WYSIWYG
- **Quản lý test case**: Tự động tạo test case bằng AI hoặc thêm thủ công
- **Quản lý cuộc thi**: Tạo contest, thiết lập thời gian, quản lý thí sinh
- **Quản lý người dùng**: Xem danh sách, phân quyền, thống kê
- **Báo cáo & Thống kê**: Dashboard với các metrics quan trọng
- **Cấu hình hệ thống**: Quản lý ngôn ngữ lập trình, cài đặt chấm điểm

### Bảo mật & Hiệu suất

- **Sandbox an toàn**: Thực thi code trong Docker containers cô lập
- **Tối ưu hiệu suất**: Caching, connection pooling, resource limits
- **Bảo mật**: Input validation, SQL injection prevention, rate limiting
- **Monitoring**: Health checks, logging, error tracking

## Công nghệ & Kiến trúc

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

_Kiến trúc hệ thống bao gồm Frontend (React), Backend API (Spring Boot), AI Service (FastAPI), và Database (PostgreSQL) được triển khai trên Docker containers._

## Hướng dẫn cài đặt & chạy

### Yêu cầu hệ thống

- **Docker** và **Docker Compose** (phiên bản mới nhất)
- **Java 17+** (nếu chạy local)
- **Node.js 18+** (nếu chạy local)
- **Python 3.9+** (nếu chạy local)
- **Git**

### Cài đặt với Docker (Khuyến nghị)

#### 1. Clone repository

```bash
git clone <repository-url>
cd OnlineCodingCompetition
```

#### 2. Cấu hình environment variables

```bash
# Copy và chỉnh sửa file .env
cp .env.example .env
nano .env

# Cấu hình cho recommendation system
cp RecommendationSystem/.env.example RecommendationSystem/.env
nano RecommendationSystem/.env
```

#### 3. Build và chạy toàn bộ hệ thống

```bash
# Build tất cả services
docker-compose -f deploy/docker-compose.prod.yml build

# Chạy hệ thống
docker-compose -f deploy/docker-compose.prod.yml up -d

# Kiểm tra trạng thái services
docker-compose -f deploy/docker-compose.prod.yml ps
```

#### 4. Khởi tạo database (lần đầu)

```bash
# Import database schema
docker-compose -f deploy/docker-compose.prod.yml exec postgres psql -U occs_user -d occs_db -f /docker-entrypoint-initdb.d/init.sql
```

### Cài đặt Development (Local)

#### Backend (Spring Boot)

```bash
cd onlineCodingCompetition

# Cài đặt dependencies
./mvnw clean install

# Chạy application
./mvnw spring-boot:run

# Hoặc với profile cụ thể
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend (React)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

#### AI Service (Python)

```bash
cd RecommendationSystem

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

### Cấu hình nâng cao

#### Database Configuration

```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://occs_user:password@localhost:5432/occs_db

# H2 Database (for development)
spring.datasource.url=jdbc:h2:mem:testdb
```

#### Docker Configuration

```bash
# Tùy chỉnh resource limits trong docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.8'
```

## Cấu trúc thư mục

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
│   ├── README.md                # This file
│   └── System_architech.png     # System architecture diagram
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── TODOS.md                      # Development roadmap
└── docker-compose.yml            # Development setup
```

### Vai trò các thư mục chính:

- **`frontend/`**: Ứng dụng React với giao diện người dùng hiện đại
- **`onlineCodingCompetition/`**: API backend xử lý logic nghiệp vụ
- **`RecommendationSystem/`**: Dịch vụ AI cho gợi ý và tự động hóa
- **`deploy/`**: Scripts và configs cho triển khai production
- **`docs/`**: Tài liệu dự án và hướng dẫn sử dụng

## Demo

### Screenshots & Videos

_[Placeholder - Thêm screenshots của các tính năng chính]_

- Dashboard admin với thống kê tổng quan
- Giao diện giải bài tập với code editor
- Trang quản lý cuộc thi
- Hệ thống recommendation AI

### Live Demo

_[Placeholder - Link đến demo trực tuyến nếu có]_

```bash
# Để chạy demo local sau khi cài đặt:
# 1. Truy cập ứng dụng chính
open http://localhost

# 2. API Documentation (Swagger)
open http://localhost:8080/swagger-ui.html

# 3. AI Service API
open http://localhost:3000/docs
```

### Test Data

```bash
# Import sample data để test
docker-compose -f deploy/docker-compose.prod.yml exec backend java -jar app.jar --import-sample-data

# Hoặc sử dụng script có sẵn
./deploy/import-sample-data.sh
```

## Roadmap / Phát triển thêm

### Ngắn hạn (1-3 tháng)

- [ ] **Tối ưu hiệu suất**: Caching Redis, tối ưu database queries
- [ ] **Mở rộng ngôn ngữ**: Thêm hỗ trợ Rust, Go, Kotlin
- [ ] **Mobile responsive**: Cải thiện giao diện trên thiết bị di động
- [ ] **Real-time features**: WebSocket cho live contest updates
- [ ] **Advanced analytics**: Thống kê chi tiết về performance

### Trung hạn (3-6 tháng)

- [ ] **Microservices architecture**: Tách thành các services độc lập
- [ ] **Advanced AI features**:
  - Plagiarism detection
  - Code quality analysis
  - Intelligent hints system
- [ ] **Collaborative features**: Team contests, pair programming
- [ ] **Advanced security**: Rate limiting, DDoS protection
- [ ] **Multi-tenant support**: Hỗ trợ nhiều tổ chức

### Dài hạn (6+ tháng)

- [ ] **Cloud-native deployment**: Kubernetes, auto-scaling
- [ ] **Advanced ML models**: Personalized learning paths
- [ ] **Integration ecosystem**: LMS integration, GitHub sync
- [ ] **Mobile applications**: Native iOS/Android apps
- [ ] **Enterprise features**: SSO, advanced reporting, audit logs

### Ý tưởng mở rộng

- **Gamification**: Badges, leaderboards, achievements
- **Learning paths**: Structured curriculum với AI guidance
- **Community features**: Forums, peer review, mentoring
- **Advanced analytics**: ML-powered insights cho educators
- **Global competitions**: Multi-region contests với ranking

## Đóng góp

### Cách đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards

- **Java**: Follow Google Java Style Guide
- **JavaScript/React**: ESLint + Prettier configuration
- **Python**: PEP 8 compliance
- **Git**: Conventional Commits format

### Bug Reports

Sử dụng GitHub Issues với template:

- **Bug description**: Mô tả chi tiết lỗi
- **Steps to reproduce**: Các bước tái hiện
- **Expected vs Actual**: Kết quả mong đợi vs thực tế
- **Environment**: OS, browser, version info

## Thông tin liên hệ

### Development Team

- **Project Lead**: [Tên của bạn]
  - Email: [your-email@example.com]
  - GitHub: [your-github-username]
  - LinkedIn: [your-linkedin-profile]

### Links

- **Website**: [project-website-url]
- **Documentation**: [docs-url]
- **Issues**: [github-issues-url]
- **Discussions**: [github-discussions-url]

### Support

- **Wiki**: Xem documentation chi tiết
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

**⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star! ⭐**

Made by OCCS Team

</div>
