# System Architecture & API Specification

## 1. High-Level Architecture
The system follows a typical 3-tier architecture containerized via Docker:
1.  **Frontend:** React SPA (Port 3000)
2.  **Backend:** Node.js/Express API (Port 5000)
3.  **Database:** PostgreSQL (Port 5432)

![System Architecture Diagram](images/system-architecture.png)

## 2. Database Schema (ERD)
The schema relies on a `tenant_id` foreign key in almost every table to ensure isolation.

* **Tenants:** `id`, `name`, `subdomain`, `plan`, `max_users`
* **Users:** `id`, `tenant_id`, `email`, `password`, `role`
* **Projects:** `id`, `tenant_id`, `name`, `status`
* **Tasks:** `id`, `tenant_id`, `project_id`, `assigned_to`, `status`

![Database ERD](images/database-erd.png)

## 3. API Endpoint Specification (19 Endpoints)

### Authentication
1.  `POST /api/auth/register-tenant` - Register new organization
2.  `POST /api/auth/login` - User login
3.  `GET /api/auth/me` - Get current user profile
4.  `POST /api/auth/logout` - Logout user

### Tenant Management
5.  `GET /api/tenants/:id` - Get tenant details
6.  `PUT /api/tenants/:id` - Update tenant (Admin only)
7.  `GET /api/tenants` - List all tenants (Super Admin only)

### User Management
8.  `POST /api/tenants/:id/users` - Add user to tenant
9.  `GET /api/tenants/:id/users` - List users in tenant
10. `PUT /api/users/:id` - Update user details
11. `DELETE /api/users/:id` - Delete user

### Project Management
12. `POST /api/projects` - Create project
13. `GET /api/projects` - List projects
14. `PUT /api/projects/:id` - Update project
15. `DELETE /api/projects/:id` - Delete project

### Task Management
16. `POST /api/projects/:id/tasks` - Create task
17. `GET /api/projects/:id/tasks` - List tasks
18. `PATCH /api/tasks/:id/status` - Update task status
19. `PUT /api/tasks/:id` - Update full task details
