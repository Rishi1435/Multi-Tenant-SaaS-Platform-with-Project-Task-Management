# Product Requirements Document (PRD)

## 1. User Personas

### A. Super Admin
* **Role:** System Owner / Platform Administrator.
* **Goals:** Manage overall system health, view all tenants, manage subscription plans.
* **Pain Points:** Lack of visibility into platform usage, inability to suspend bad actors.

### B. Tenant Admin
* **Role:** Manager of a specific organization (Tenant).
* **Goals:** Manage team members, oversee projects, ensure billing compliance.
* **Pain Points:** Onboarding new users is tedious, data leakage concerns.

### C. End User
* **Role:** Individual Contributor / Employee.
* **Goals:** Complete tasks, view project status, collaborate.
* **Pain Points:** Confusing interface, difficulty finding assigned tasks.

## 2. Functional Requirements (FR)

### Authentication & Authorization
* **FR-001:** The system shall allow new organizations to register as tenants with a unique subdomain.
* **FR-002:** The system shall support user login via Email and Password.
* **FR-003:** The system shall use JWT (JSON Web Tokens) for maintaining user sessions.
* **FR-004:** The system shall restrict access to resources based on roles (Super Admin, Tenant Admin, User).

### Tenant Management
* **FR-005:** The system shall allow Super Admins to view a list of all registered tenants.
* **FR-006:** The system shall allow Tenant Admins to update their organization's name.
* **FR-007:** The system shall enforce data isolation so users cannot see other tenants' data.

### User Management
* **FR-008:** The system shall allow Tenant Admins to add new users to their organization.
* **FR-009:** The system shall prevent adding users if the subscription limit (Max Users) is reached.
* **FR-010:** The system shall allow Tenant Admins to delete users (soft delete or cascade).

### Project Management
* **FR-011:** The system shall allow users to create new projects with a name and description.
* **FR-012:** The system shall enforce project limits based on the tenant's subscription plan.
* **FR-013:** The system shall allow users to view a list of projects associated with their tenant.

### Task Management
* **FR-014:** The system shall allow users to create tasks within a specific project.
* **FR-015:** The system shall allow users to assign tasks to other users within the same tenant.
* **FR-016:** The system shall allow updating task status (Todo -> In Progress -> Done).

## 3. Non-Functional Requirements (NFR)
* **NFR-001 (Performance):** API response time shall be under 200ms for 95% of requests.
* **NFR-002 (Security):** All user passwords must be hashed using bcrypt before storage.
* **NFR-003 (Scalability):** The database schema shall support indexing on `tenant_id` to maintain query performance as data grows.
* **NFR-004 (Availability):** The system shall be containerized to ensure rapid recovery and deployment (Docker).
* **NFR-005 (Usability):** The Frontend UI shall be responsive and function correctly on mobile devices.
