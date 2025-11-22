**StockMaster – Product Specification Document (Final Version for TestSprite)**
===============================================================================

**1\. Overview**
----------------

StockMaster is a warehouse inventory management system inspired by Odoo.The system handles:

*   Inventory stock management
    
*   Receipts (incoming goods)
    
*   Deliveries (outgoing goods)
    
*   Move History tracking
    
*   Warehouse and Location setup
    
*   Product management
    
*   Status pipelines (Draft → Ready → Done, including Waiting state in Delivery)
    
*   CRUD operations for all entities
    
*   Search, filtering, and list/detail views
    
*   Auto-generation of references and stock calculations
    

Frontend: **Next.js 14, TypeScript, Tailwind UI**Backend: **Supabase (PostgreSQL)**Tests: **To be generated/automated by TestSprite**

**2\. Functional Modules**
==========================

**2.1 Dashboard (Global Navigation)**
-------------------------------------

Top navbar must appear on all pages:

*   Dashboard
    
*   Operations
    
*   Products
    
*   Move History
    
*   Settings
    
*   User Avatar (static letter “A”)
    

A red horizontal separator must appear under the navbar on every page.

**3\. Warehouse Configuration**
===============================

### **Page: Warehouse**

**Fields:**

*   Name (text input, underline style)
    
*   Short Code (text input; used in reference ID generation)
    
*   Address (text input)
    

**Behavior:**

*   CRUD must work fully (create, edit, update, delete)
    
*   Short Code is required because other modules depend on it
    

**4\. Location Configuration**
==============================

### **Page: Location**

**Fields:**

*   Name
    
*   Short Code
    
*   Warehouse (dropdown; lowercase “warehouse” in UI)
    

**Behavior:**

*   CRUD must work
    
*   Locations must connect to warehouses via foreign key
    
*   Locations appear in dropdowns in Receipts, Delivery, Move History, and Stock
    

**5\. Product Management**
==========================

### **Fields:**

*   Product Name
    
*   Product Code
    
*   Cost Per Unit
    

**Behavior:**

*   CRUD required
    
*   Products appear in Receipts + Deliveries product tables
    

**6\. Stock Page**
==================

### **Columns:**

*   Product
    
*   Per Unit Cost
    
*   On Hand
    
*   Free to Use
    

**Behavior:**

*   Editable via Receipts + Deliveries
    
*   "Free to Use" = OnHand – Reserved quantities
    
*   Search must work
    
*   Clicking a product must open detail page
    

**7\. Receipts (Incoming Goods)**
=================================

**List View**
-------------

Columns:

*   Reference
    
*   From
    
*   To
    
*   Contact
    
*   Schedule Date
    
*   Status
    

Actions:

*   NEW (create record)
    
*   Search by reference/contact
    
*   Switch List/Kanban view
    

**Auto Reference Format**
-------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   //  Example: WH/IN/0001   `

**Detail View**
---------------

Fields:

*   Reference (display only)
    
*   Receive From (vendor)
    
*   Schedule Date
    
*   Responsible (auto-filled with logged-in user)
    

### **Products Table**

*   Product
    
*   Quantity
    
*   New Product (add row button)
    

### **Pipeline**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Draft → Ready → Done   `

### **Behavior Rules**

*   TODO button: moves Draft → Ready
    
*   Validate button: moves Ready → Done
    
*   Print available ONLY in Done
    
*   On Done:
    
    *   Stock increases
        
    *   Move History entry auto-created
        

**8\. Delivery (Outgoing Goods)**
=================================

**List View**
-------------

Columns:

*   Reference
    
*   From
    
*   To
    
*   Contact
    
*   Schedule Date
    
*   Status
    

Behavior identical to Receipts list view.

**Detail View**
---------------

Fields:

*   Delivery Address
    
*   Schedule Date
    
*   Responsible
    
*   Operation Type (dropdown)
    

### **Products Table**

Same as Receipts.

### **Pipeline**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Draft → Waiting → Ready → Done   `

### **Rules**

*   If product stock is insufficient:
    
    *   Status = Waiting
        
    *   Row should highlight RED
        
*   Print only in Done
    
*   On Done:
    
    *   Stock decreases
        
    *   Move History entry auto-created
        

**9\. Move History**
====================

**List View**
-------------

Columns:

*   Reference
    
*   Date
    
*   Contact
    
*   From
    
*   To
    
*   Quantity
    
*   Status
    

### **Rules**

*   Auto-populated when:
    
    *   Delivery validated
        
    *   Receipt validated
        

### **Color Rules**

*   Inbound (IN): **green**
    
*   Outbound (OUT): **red**
    
*   Multiple product lines = multiple rows with same reference
    

**10\. Status Pipelines (Global Rules)**
========================================

### **Receipts**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Draft → Ready → Done   `

### **Delivery**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Draft → Waiting → Ready → Done   `

### **Move History**

*   Auto-generated
    
*   Must reflect true movement
    

Pipeline widgets must match wireframe design exactly.

**11\. Search + Filter Requirements**
=====================================

Every list page must support search on:

*   reference
    
*   contact
    
*   product
    
*   warehouse
    
*   location
    

Buttons MUST NOT be decorative — they must work.

**12\. Navigation Requirements**
================================

Every row inside:

*   Receipts
    
*   Deliveries
    
*   Move History
    
*   Stock
    
*   Products
    
*   Warehouse
    
*   Locations
    

must open its corresponding detail/edit page.

No page should remain static.

**13\. Supabase Database Specification**
========================================

Required tables:

### **warehouses**

*   id (uuid)
    
*   name
    
*   short\_code
    
*   address
    

### **locations**

*   id
    
*   name
    
*   short\_code
    
*   warehouse\_id (FK → warehouses)
    

### **products**

*   id
    
*   code
    
*   name
    
*   unit\_cost
    

### **inventory**

*   id
    
*   product\_id
    
*   location\_id
    
*   quantity
    

### **receipts**

*   id
    
*   reference
    
*   from\_location
    
*   to\_location
    
*   contact
    
*   schedule\_date
    
*   status
    
*   responsible
    

### **delivery**

*   id
    
*   reference
    
*   from\_location
    
*   to\_location
    
*   contact
    
*   schedule\_date
    
*   status
    
*   responsible
    

### **receipt\_lines / delivery\_lines**

*   id
    
*   parent\_id
    
*   product\_id
    
*   quantity
    

### **move\_history**

*   id
    
*   reference
    
*   product\_id
    
*   from\_location
    
*   to\_location
    
*   quantity
    
*   contact
    
*   date
    
*   status
    
*   type (IN/OUT)
    

**14\. Auto-Logic Requirements**
================================

### Must implement:

*   Auto reference generator
    
*   Auto-status transitions
    
*   Stock increases on receipt Done
    
*   Stock decreases on delivery Done
    
*   Waiting triggered when stock insufficient
    
*   Move history lines auto-created on each Done
    
*   Responsible auto-filled
    
*   Kanban views for Receipts & Delivery
    

**15\. Print Functionality**
============================

Print button should:

*   Only be usable in Done
    
*   Generate a clean, printable layout
    
*   Include reference, status, product lines
    

**16\. Error Handling Requirements**
====================================

The system must avoid:

*   undefined.map errors
    
*   missing handlers
    
*   uninitialized arrays
    
*   broken dropdowns
    
*   failed API responses
    
*   broken navigation
    
*   inconsistent stock updates
    

All lists must gracefully handle "No Data" states.

**17\. Overall Acceptance Criteria**
====================================

The product is considered complete when:

*   All wireframe elements exist
    
*   All actions work
    
*   All CRUD operations function
    
*   All navigation paths work
    
*   All pipelines behave correctly
    
*   Stock updates correctly
    
*   Move History logs everything accurately
    
*   Searches work everywhere
    
*   No console runtime errors appear
    
*   No Supabase errors occur
    
*   Tests (e2e/ui/functional) pass