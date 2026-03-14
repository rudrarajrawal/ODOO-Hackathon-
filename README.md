📦 Core Inventory Management System
📌 Project Overview

The Core Inventory Management System is a web-based application designed to manage products, suppliers/customers, and delivery orders efficiently. The system helps administrators track inventory levels, manage people involved in the supply chain, and monitor product orders.

This project is built using Node.js, Express.js, SQLite, HTML, CSS, JavaScript, and Bootstrap to provide a simple and responsive admin interface for inventory control.

🚀 Features
1️⃣ Authentication System

A simple login authentication module is implemented for admin access.

Default Admin Credentials

Email: admin@inventory.com

Password: 123456

After successful login, the user is redirected to the Dashboard.

📊 Dashboard

The dashboard provides a quick overview of inventory status through summary cards.

Dashboard Metrics

Total Products

Total Suppliers

Total Orders

Low Stock Items

The dashboard also includes a sidebar navigation menu for easy access to modules.

Sidebar Menu

Dashboard

Products

People

Orders

Logout

📦 Products Management

The Products module allows administrators to manage inventory items.

Product Table Fields

ID

Product Name

Category

Price

Stock Quantity

Supplier

Actions (Edit / Delete)

Add Product Form

Product Name

Category

Price

Stock Quantity

Supplier

CRUD Operations

The module supports full CRUD functionality:

Create Product

View Product List

Edit Product

Delete Product

👥 People Management

The People module manages suppliers and customers.

Fields

Name

Phone

Email

Address

Type (Supplier / Customer)

Table Columns

ID

Name

Type

Phone

Email

Address

Actions (Edit / Delete)

Features

Add People

Edit People

Delete People

View List

🚚 Orders / Delivery Management

The Orders module tracks product deliveries and customer orders.

Order Fields

Order ID

Product

Customer

Quantity

Order Date

Status (Pending / Delivered)

Inventory Logic

When a new order is created, the system automatically reduces product stock.

Example:

Product Stock = 50
Order Quantity = 5

New Stock = 45

⚠️ Inventory Logic

The system includes basic inventory management rules:

When an order is created → Stock is reduced

When stock falls below a threshold (10 units) → Marked as LOW STOCK

Low stock alerts are displayed on the Dashboard

🎨 UI Design

The interface is built using Bootstrap to provide a clean and responsive admin layout.

Layout Structure

Left Sidebar Navigation

Top Header Bar

Main Content Area

Table Features

Search Bar

Responsive Design

Pagination (optional)

🗂 Project Structure
inventory-system
│
├── server.js
├── database
│   └── inventory.db
│
├── routes
│   ├── auth.js
│   ├── products.js
│   ├── people.js
│   └── orders.js
│
├── models
│   ├── productModel.js
│   ├── peopleModel.js
│   └── orderModel.js
│
└── public
    ├── login.html
    ├── dashboard.html
    ├── products.html
    ├── people.html
    ├── orders.html
    ├── css
    └── js
🗄 Database Schema
Users Table
Field	Description
id	Primary Key
email	User Email
password	User Password
Products Table
Field	Description
id	Product ID
name	Product Name
category	Product Category
price	Product Price
stock	Stock Quantity
supplier_id	Supplier Reference
People Table
Field	Description
id	Person ID
name	Person Name
type	Supplier / Customer
phone	Contact Number
email	Email Address
address	Address
Orders Table
Field	Description
id	Order ID
product_id	Product Reference
customer_id	Customer Reference
quantity	Ordered Quantity
status	Order Status
date	Order Date
🛠 Technologies Used

Node.js

Express.js

SQLite

HTML5

CSS3

JavaScript

Bootstrap

