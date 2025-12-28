
# 🛠️ MAINTENIX - Modern Maintenance Management System

![Maintenix Dashboard](.maintenix/public/dashboard.png)

## 🚀 Live Demo
**[Deploy URL Placeholder]**

---

## 🧐 The Problem
In the fast-paced industrial and manufacturing sectors, effective maintenance management is often the bottleneck that hampers productivity. Companies face several critical challenges:

- **Chaotic Workflows**: Maintenance requests are tracked via spreadsheets, emails, or verbal communication, leading to lost requests and lack of accountability.
- **Downtime**: Without predictive and organized maintenance, equipment failure rates increase, causing costly production downtime.
- **Resource Misallocation**: Technicians are often double-booked or idle due to poor scheduling visibility.
- **Lack of Transparency**: Stakeholders (Admins, Managers, Employees) lack a unified view of the system's health.

## 💡 The Solution
**MAINTENIX** is a comprehensive, role-based maintenance management platform designed to streamline operations, reduce downtime, and enhance accountability.

By centralizing equipment tracking, work orders, and team management, Maintenix provides:
- **Role-Based Clarity**: Distinct interfaces for Admins, Technicians, and Employees ensure everyone focuses on what matters to them.
- **Real-Time Tracking**: From "New" to "Repaired", every request is tracked with timestamps and priority levels.
- **Data-Driven Insights**: A powerful dashboard visualizes critical metrics like Technician Load, Critical Equipment, and Request Urgency.
- **Preventive Maintenance**: Schedule recurring tasks to fix machines before they break.

---

## ✨ Key Features

### 👑 Role-Based Access Control (RBAC)
- **Admin & Manager**: Full oversight of equipment, teams, and requests. Analytics dashboard for high-level decision making.
- **Technician**: Focused view of assigned tasks ("My Tasks") to streamline daily work.
- **Employee**: Simple interface to report issues and track the status of their requests.

### 📊 Dynamic Dashboard
- **Critical Stats**: Immediate visibility into broken equipment and urgent requests.
- **Technician Load**: Monitor workforce capability to prevent burnout or underutilization.
- **Recent Activity**: Real-time feed of the latest maintenance requests.

### 🏭 Asset & Work Center Management
- Track equipment with detailed metadata (Serial #, Warranty, Location).
- Organize assets by Category and Work Center.

### 🔧 Work Order Management
- Prioritize requests (Low, Medium, High, Urgent).
- Assign specific teams/technicians.
- Track time and duration of repairs.

---

## 🛠️ Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)

### DevOps
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/develper21/odoo-adani.git
   cd maintenix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the Database**
   Start the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

4. **Prepare Environment**
   Renamed `.env.example` to `.env` and update credentials if necessary.
   ```bash
   # Create usage from example
   cp .env.example .env
   ```

5. **Run Migrations & Seed Data**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

6. **Start the App**
   ```bash
   npm run dev
   ```

7. **Login credentials (seeded)**
   - **Admin**: `admin@maintenix.com` / `password123`
   - **Manager**: `manager@maintenix.com` / `password123`
   - **Technician**: `tech@maintenix.com` / `password123`
   - **Employee**: `employee@maintenix.com` / `password123`

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
