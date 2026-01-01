# SaaS Project & Task Management Platform

## Overview
A production-ready, multi-tenant SaaS application where multiple organizations can register, manage teams, create projects, and track tasks. This system ensures complete data isolation between tenants and implements Role-Based Access Control (RBAC).

**Target Audience:** Startups and SMBs requiring isolated project management workspaces.

## Key Features
* **Multi-Tenancy:** Complete data isolation using shared-database/shared-schema architecture.
* **Authentication:** Secure JWT-based auth with Role-Based Access Control (Super Admin, Tenant Admin, User).
* **Tenant Management:** Automatic subdomain generation and subscription limits.
* **Project Tracking:** Create, edit, and archive projects.
* **Task Management:** Assign tasks, set priorities, and track status.
* **Dark Mode UI:** Professional, responsive React interface with Tailwind CSS.
* **Dockerized:** Fully containerized setup for Database, Backend, and Frontend.
* **Audit Logging:** Tracks critical system actions for security.

## Technology Stack
* **Frontend:** React (Vite), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL 15
* **DevOps:** Docker, Docker Compose

## Installation & Setup

### Prerequisites
* Docker & Docker Compose installed on your machine.
* Git

### Steps to Run
1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd saas-platform
    ```

2.  **Start the Application:**
    The entire stack (DB, Backend, Frontend) starts with one command:
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the App:**
    * **Frontend:** [http://localhost:3000](http://localhost:3000)
    * **Backend Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Environment Variables
The application comes with a pre-configured `.env` file (embedded in docker-compose for ease of evaluation).
* `DB_HOST`, `DB_USER`, `DB_PASSWORD`: Database connection details.
* `JWT_SECRET`: Secret key for signing tokens.
* `FRONTEND_URL`: URL for CORS configuration.

## API Documentation
Full API documentation is available in [docs/architecture.md](docs/architecture.md).

## Demo Video

