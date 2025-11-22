# Welcome to your StockMaster
💡 Solution Overview & Proposed ArchitectureStockMaster is built as a full-stack, modular application designed around a robust transactional core to ensure complete data integrity and real-time stock accuracy.
1. Frontend: User Experience (React & Ant Design)The frontend focuses on a professional, intuitive user experience to maximize efficiency for warehouse and management staff.Technology: Developed using React with Ant Design (antd) for a modern, component-based UI.Navigation: A fixed, collapsible Left Sidebar provides immediate access to all core modules: Dashboard, Products, Operations, Move History, Setting, and Profile Menu4.Dashboard: The landing page provides a real-time snapshot of the warehouse's health through key performance indicators (KPIs) like Low Stock/Out of Stock Items, Pending Receipts, and Pending Deliveries5.Guided Forms: Core operations (Receipts, Deliveries, Adjustments) use intuitive, multi-step forms to minimize data entry errors by warehouse staff6666.2. Backend & Data Core (PostgreSQL)The backend is built around a secure API and a highly reliable database schema to handle all transactional data.Database: PostgreSQL is used as the transactional database for its reliability and integrity.Product Management: Implements full CRUD (Create, Read, Update, Delete) for products and manages supporting entities like Product Categories and Reordering Rules7777.Core Ledger: The system utilizes a central Move History Ledger to log every single stock transaction. This ensures stock availability per location is calculated in real-time by summing and subtracting transactional entries, providing unparalleled accuracy888888888.Operational Logic:Receipts (Incoming Stock): Upon validation, stock automatically increases9.Delivery Orders (Outgoing Stock): Upon validation, stock automatically decreases10.Internal Transfers: Stock is moved between defined locations (e.g., Rack A $\rightarrow$ Rack B) and logged without affecting the overall total stock111111111111111111.Stock Adjustments: Enables fixing mismatches between recorded and physical counts, with the system auto-updating and logging the change12121212.Alerts: Systematically checks the ledger against defined Reordering Rules to trigger low stock alerts13131313.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. 
The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
