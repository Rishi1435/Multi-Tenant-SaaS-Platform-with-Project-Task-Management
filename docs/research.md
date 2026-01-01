# Research Document: Multi-Tenant SaaS Architecture

## 1. Multi-Tenancy Analysis
**Objective:** Compare architecture patterns to select the best fit for a scalable SaaS platform.

Multi-tenancy is a software architecture where a single instance of software serves multiple tenants (customers). A tenant is a group of users who share a common access with specific privileges to the software instance. In a SaaS environment, ensuring that each tenant's data is isolated and invisible to other tenants is the primary architectural challenge.

### Approaches Comparison

We evaluated three primary database architecture patterns for multi-tenancy:

#### A. Separate Database per Tenant
In this model, each tenant has their own dedicated database instance.
* **Pros:** Highest level of data isolation (physical separation). If one tenant's database is corrupted, others are unaffected. easy to backup/restore individual tenant data.
* **Cons:** Extremely resource-intensive. High infrastructure costs as you pay for overhead per database. Complex DevOps automation required to provision new databases for every signup. Scalability is limited by the number of database connections the server can handle.

#### B. Shared Database, Separate Schemas
In this model, all tenants share one database, but each tenant has their own schema (namespace) with identical tables.
* **Pros:** Good logical isolation. Data is separate at the schema level. Easier to manage than separate databases.
* **Cons:** Database migration tools often struggle with thousands of schemas. Cross-tenant reporting is difficult. A high number of schemas can still degrade database performance due to metadata overhead.

#### C. Shared Database, Shared Schema (Selected Approach)
In this model, all tenants share the same database and the same tables. Every table has a `tenant_id` column to associate rows with specific tenants.
* **Pros:** Lowest infrastructure cost (single DB instance). Easiest to deploy and update (one migration runs for everyone). Best performance for resource utilization.
* **Cons:** Lowest isolation level (logical only). Requires strict developer discipline to ensure every SQL query includes `WHERE tenant_id = X`. Risk of data leakage if a developer forgets the filter.

### Comparison Summary

| Feature | Shared Database + Shared Schema | Shared Database + Separate Schema | Separate Database |
| :--- | :--- | :--- | :--- |
| **Isolation** | Low (Row-level security required) | Medium (Schema-level isolation) | High (Physical data separation) |
| **Cost** | Low (Single instance) | Medium | High (Resource intensive) |
| **Complexity** | High (Dev must handle isolation logic) | Medium (Migration complexity) | High (DevOps/Deployment heavy) |
| **Scalability**| High (Vertical/Horizontal scaling of one DB) | Medium | Low (Hard to manage thousands of DBs) |
| **Onboarding** | Instant (Just insert row in Tenants table) | Slow (Must create new Schema) | Very Slow (Must provision new DB) |

### Selected Approach: Shared Database with Shared Schema
We have chosen the **Shared Database with Shared Schema** approach where tenants are distinguished by a `tenant_id` column.

**Detailed Justification:**
1.  **Economic Viability for MVP:** For a new SaaS platform, keeping infrastructure costs low is critical. Running a single database instance on a standard tier is significantly cheaper than provisioning separate instances or managing the overhead of thousands of schemas.
2.  **Operational Simplicity:** Continuous Deployment (CD) is simplified. When we push a code update that requires a database migration (e.g., adding a column to the `tasks` table), we run the migration command once. In the separate schema approach, the migration script would need to iterate through every single tenant's schema, which can take hours and is prone to failure.
3.  **Modern ORM Support:** We are using Sequelize (Node.js ORM), which has excellent support for "Scopes." We can define a global scope that automatically injects `WHERE tenant_id = ?` into every query. This mitigates the primary risk of this approach (developer error) by handling isolation at the framework level rather than the query level.
4.  **Scalability:** This architecture scales well horizontally. If the database grows too large, we can eventually move to "Sharding," where we split tenants across different database servers based on their ID, effectively hybridizing the approach later. For the current scope (0-10,000 tenants), a single shared schema is the most performant choice.

## 2. Technology Stack Justification

### Backend Framework: Node.js & Express
We selected **Node.js with Express** over Python/Django or Java/Spring for the following reasons:
* **Non-Blocking I/O:** SaaS applications typically handle high concurrency with many small I/O operations (CRUD on tasks, projects). Node.js's event-driven architecture handles this more efficiently than thread-based blocking architectures.
* **Unified Language:** Using JavaScript/TypeScript on both frontend and backend reduces context switching for developers and allows code sharing (e.g., validation types/interfaces).
* **Ecosystem:** The NPM ecosystem provides robust libraries for every requirement: `jsonwebtoken` for auth, `bcryptjs` for security, and `sequelize` for database management.
* **Performance:** V8 engine execution is highly optimized for the JSON manipulation that characterizes REST APIs.

### Frontend Framework: React (Vite) & Tailwind CSS
* **React:** Chosen for its component-based architecture. A dashboard UI relies heavily on reusable components (Cards, Tables, Modals). React's virtual DOM ensures the UI remains responsive even when displaying large lists of tasks or projects.
* **Vite:** We chose Vite over Create-React-App (CRA) because Vite uses native ES modules during development, resulting in near-instant server start and hot module replacement (HMR), significantly boosting developer productivity.
* **Tailwind CSS:** A utility-first CSS framework. It allows us to implement the required "Dark Theme" simply by adding a class. It prevents CSS bloat and ensures design consistency across the application without maintaining large external stylesheets.

### Database: PostgreSQL
* **Relational Integrity:** Unlike MongoDB (NoSQL), PostgreSQL enforces strict foreign key constraints (ACID compliance). This is non-negotiable for a multi-tenant system where orphan records (e.g., a task existing without a tenant) are a security risk.
* **JSONB Support:** Postgres offers the flexibility of NoSQL via JSONB columns, allowing us to store unstructured data (like audit log details) while keeping core data structured.
* **Industry Standard:** It is the standard choice for enterprise SaaS due to its reliability, complex query capabilities, and row-level security features.

### Authentication: JSON Web Tokens (JWT)
* **Statelessness:** We chose JWT over server-side sessions to enable easy horizontal scaling. With server-side sessions, we would need a Redis store to share session data across multiple backend instances. JWTs are self-contained; the backend only needs the secret key to verify them.
* **Performance:** No database lookup is required to verify a user's session on every request, reducing database load.
* **Mobile Ready:** JWTs are easier to use if we later decide to build a native mobile app.

### Deployment: Docker & Docker Compose
* **Reproducibility:** Docker is mandatory for this project to ensure the "works on my machine" guarantee. It encapsulates dependencies (Node version, Postgres version) into containers.
* **Isolation:** The frontend, backend, and database run in separate containers, mimicking a production microservices architecture.
* **Orchestration:** Docker Compose allows us to define the networking between these services (e.g., Backend talking to Database on port 5432) in code, making deployment a single-command process (`docker-compose up`).

## 3. Security Considerations

Securing a multi-tenant application requires a "Defense in Depth" strategy. We are implementing the following five core security measures:

#### 1. Strict Data Isolation (Logical Separation)
The most critical risk in this architecture is one tenant accessing another's data.
* **Strategy:** Every single database query affecting tenant data must include a `WHERE tenant_id = ?` clause.
* **Implementation:** We implement this via middleware. The `tenant_id` is extracted from the validated JWT token and injected into the request object. The Service layer consumes this ID and applies it to ORM queries. We do not rely on the client sending the `tenant_id` in the request body, as this can be spoofed.

#### 2. Secure Authentication & Session Management
* **JWT Security:** Tokens are signed with a strong HS256 algorithm. They have a short lifespan (24 hours) to minimize the window of opportunity if a token is stolen.
* **Password Storage:** We never store plain-text passwords. We use **bcryptjs** with a salt round of 10. This makes rainbow table attacks infeasible.
* **No Sensitive Data in Token:** The JWT payload contains only `userId`, `tenantId`, and `role`. It specifically excludes PII (Personally Identifiable Information) or passwords.

#### 3. Role-Based Access Control (RBAC)
Authentication identifies the user; authorization controls what they can do.
* **Implementation:** We define three distinct roles: `super_admin`, `tenant_admin`, and `user`.
* **Enforcement:** Middleware functions (e.g., `checkRole(['tenant_admin'])`) run before the controller logic. For example, the "Delete User" endpoint is protected so that only a `tenant_admin` can execute it. A regular user attempting this will receive a `403 Forbidden` response.

#### 4. API Security & Input Validation
* **Input Validation:** We treat all input as hostile. We validate incoming data types (e.g., ensuring email format, ensuring password length) before processing. This prevents SQL Injection and common buffer overflow attacks.
* **CORS (Cross-Origin Resource Sharing):** The backend is configured to accept requests *only* from the specific frontend domain (defined in environment variables). This prevents malicious websites from making requests to our API on behalf of a logged-in user.
* **Rate Limiting:** (Planned for production) preventing brute-force login attacks.

#### 5. Comprehensive Audit Logging
* **Objective:** In the event of a security incident, we must know *who* did *what* and *when*.
* **Implementation:** An `audit_logs` table records critical write operations (CREATE, UPDATE, DELETE).
* **Captured Data:** Each log entry includes the `actor_id` (user), `action_type` (e.g., "DELETE_PROJECT"), `resource_id`, `tenant_id`, and `timestamp`. This provides an immutable trail of evidence for tenant administrators.
