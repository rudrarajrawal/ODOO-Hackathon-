# CoreInventory – Inventory Management System

## Overview

CoreInventory is a modular **Inventory Management System (IMS)** built to digitize and streamline stock management within a business. It replaces manual registers, spreadsheets, and scattered tracking methods with a **centralized, real-time application** that manages product inventory, warehouse operations, and stock movements efficiently.

This project was developed as part of an **8-hour hackathon challenge**, focusing on delivering a working core inventory workflow.



# Problem Statement

Businesses often manage inventory using manual records or Excel sheets, which leads to:

* Data inconsistencies
* Stock mismatches
* Lack of real-time visibility
* Difficult tracking of product movements

CoreInventory solves these issues by providing a **centralized platform** for managing products, inventory movements, and warehouse operations.



# Target Users

### Inventory Managers

Responsible for managing stock operations such as receiving goods, delivering items, and monitoring inventory levels.

### Warehouse Staff

Handle operational tasks like:

* Picking
* Packing
* Transfers
* Inventory counting



# Key Features

## 1. Authentication

* User login and signup
* Secure access to inventory dashboard
* Profile management


# 2. Dashboard

The dashboard provides a quick snapshot of inventory activity.

### Dashboard KPIs

* Total Products in Stock
* Low Stock / Out of Stock Items
* Pending Receipts
* Pending Deliveries
* Scheduled Internal Transfers

### Filters

Users can filter operations by:

* Document Type (Receipts, Deliveries, Transfers, Adjustments)
* Status (Draft, Waiting, Ready, Done, Cancelled)
* Warehouse or location
* Product category



# 3. Product Management

Users can create and manage products.

### Product Fields

* Product Name
* SKU / Product Code
* Category
* Unit of Measure
* Initial Stock (optional)

### Capabilities

* Create products
* Update product details
* Track stock per warehouse/location

# 4. Inventory Operations

## Receipts (Incoming Goods)

Used when products arrive from vendors.

### Workflow

1. Create receipt
2. Add supplier and products
3. Enter received quantities
4. Validate receipt

### Result

Stock quantity increases automatically.

Example:

Receive 50 units of Steel Rods
Inventory → +50


## Delivery Orders (Outgoing Goods)

Used when products are shipped to customers.

### Workflow

1. Pick items
2. Pack items
3. Validate delivery

### Result

Stock quantity decreases.

Example:

Deliver 10 chairs
Inventory → -10


## Internal Transfers

Transfers stock between locations or warehouses.

Examples:

* Main Warehouse → Production Floor
* Rack A → Rack B
* Warehouse 1 → Warehouse 2

Stock quantity remains the same overall but **location changes**.



## Inventory Adjustments

Used when there is a mismatch between recorded and physical stock.

### Adjustment Process

1. Select product and location
2. Enter counted quantity
3. System updates inventory

Example:

3 damaged items detected
Inventory → -3


# Stock Movement Ledger

Every inventory operation creates a **movement record**.

Ledger tracks:

* Product
* Operation type
* Quantity change
* Source location
* Destination location
* Timestamp

This ensures **full traceability of stock movements**.


# Additional Features

* Low stock alerts
* Multi-warehouse support
* Smart SKU search
* Operation filters
* Inventory history tracking



# Example Inventory Flow

### Step 1 – Receive Goods

Receive 100 kg steel from vendor
Inventory → +100

### Step 2 – Internal Transfer

Move stock to production rack
Inventory total unchanged

### Step 3 – Deliver Goods

Deliver 20 steel frames
Inventory → -20

### Step 4 – Adjustment

3 kg steel damaged
Inventory → -3

All movements are automatically recorded in the ledger.

---

# System Architecture

### Frontend

* User interface
* Dashboard visualization
* Operation forms
* Product management screens

### Backend

* API services
* Business logic
* Inventory calculation

### Database

Stores:

* Users
* Products
* Warehouses
* Inventory records
* Movement history

---

# Project Structure

```
coreinventory/
│
├── backend/
│   ├── controllers
│   ├── routes
│   ├── models
│   └── services
│
├── frontend/
│   ├── pages
│   ├── components
│   └── dashboard
│
└── database/
    └── schema.sql
```

---

# Core Modules

* Authentication
* Dashboard
* Product Management
* Receipts
* Delivery Orders
* Inventory Adjustments
* Internal Transfers
* Stock Ledger

---

# Future Improvements

* Barcode scanning
* Advanced analytics
* Supplier management
* Automated reorder system
* Mobile warehouse app
* AI demand forecasting

---

# Demo Workflow

1. Create a product
2. Receive stock from supplier
3. Transfer stock to another location
4. Deliver items to customer
5. Adjust damaged inventory

The dashboard updates automatically as inventory changes.

---

# Team

Developed by the hackathon team as part of the **CoreInventory challenge**.

---

# License

This project is intended for educational and hackathon use.

