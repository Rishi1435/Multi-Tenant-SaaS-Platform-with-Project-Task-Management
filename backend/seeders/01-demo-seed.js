'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hardcoded IDs for consistency
    const tenantId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
    const superAdminId = 'a1111111-1111-1111-1111-111111111111';
    const tenantAdminId = 'b2222222-2222-2222-2222-222222222222';
    const user1Id = 'c3333333-3333-3333-3333-333333333333';
    const projectId = 'd4444444-4444-4444-4444-444444444444';

    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const demoPassHash = await bcrypt.hash('Demo@123', 10);
    const userPassHash = await bcrypt.hash('User@123', 10);

    // 1. Create Tenant
    await queryInterface.bulkInsert('tenants', [{
      id: tenantId,
      name: 'Demo Company',
      subdomain: 'demo',
      status: 'active',
      subscription_plan: 'pro',
      max_users: 25,
      max_projects: 15,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // 2. Create Users
    await queryInterface.bulkInsert('users', [
      {
        id: superAdminId,
        tenant_id: null, // Super Admin has no tenant
        email: 'superadmin@system.com',
        password_hash: passwordHash,
        full_name: 'System Super Admin',
        role: 'super_admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: tenantAdminId,
        tenant_id: tenantId,
        email: 'admin@demo.com',
        password_hash: demoPassHash,
        full_name: 'Demo Admin',
        role: 'tenant_admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: user1Id,
        tenant_id: tenantId,
        email: 'user1@demo.com',
        password_hash: userPassHash,
        full_name: 'Demo User 1',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 3. Create Project
    await queryInterface.bulkInsert('projects', [{
      id: projectId,
      tenant_id: tenantId,
      name: 'Project Alpha',
      description: 'First demo project',
      status: 'active',
      created_by: tenantAdminId,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // 4. Create Task
    await queryInterface.bulkInsert('tasks', [{
      id: uuidv4(),
      project_id: projectId,
      tenant_id: tenantId,
      title: 'Initial Setup',
      description: 'Setup the project environment',
      status: 'todo',
      priority: 'high',
      assigned_to: user1Id,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('tenants', null, {});
  }
};