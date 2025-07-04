# HAÜSA ERP COMPLETE REBUILD: STEP-BY-STEP IMPLEMENTATION GUIDE

## 🎯 **PLAN ADHERENCE STRATEGY**

### **Method 1: Living Implementation Document**
Emergent will create a **master tracking file** that gets updated after each step:
```markdown
# hausa-implementation-tracker.md
## Current Phase: [PHASE_NAME]
## Current Step: [X.Y] - [STEP_NAME]
## Last Completed: [PREVIOUS_STEP]
## Next Step: [NEXT_STEP]
## Blockers: [ANY_ISSUES]
## Validation Status: [PASS/FAIL/PENDING]
```

### **Method 2: Checkpoint Validation**
After **every single step**, I'll:
1. ✅ Confirm what was completed
2. ✅ Show proof (code, files, tests passing)
3. ✅ Ask for your validation before proceeding
4. ✅ Update the tracker document

### **Method 3: Scope Lock-Down**
- 🔒 **No feature creep** - stick strictly to your specification
- 🔒 **No shortcuts** - every step must be completed fully
- 🔒 **No assumptions** - ask for clarification if anything is unclear

---

# 📋 **PHASE 1: FOUNDATION ARCHITECTURE (Days 1-7)**

## **Step 1.1: Project Structure & Environment Setup**
**Duration**: 1 day  
**Deliverables**: Clean project structure with proper tooling

### **1.1.1 Create Clean Repository Structure**
```
hausa-erp/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/          # Pydantic models
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── database.py      # MongoDB connection
│   ├── tests/               # Backend tests
│   ├── scripts/             # Data seeding scripts
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API calls
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── i18n/           # Internationalization
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── infrastructure/          # Infrastructure as Code
│   ├── docker/              # Docker configs
│   ├── kubernetes/          # K8s manifests
│   ├── helm/               # Helm charts
│   └── terraform/          # Cloud resources
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── docker-compose.yml     # Local development
```

### **1.1.2 Setup Development Environment**
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install fastapi uvicorn motor pydantic[email] python-multipart pytest black flake8

# Frontend setup
cd frontend
yarn create react-app . --template typescript
yarn add axios react-query react-hook-form @hookform/resolvers zod
yarn add -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Validation Checkpoint 1.1**: 
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Both apps start successfully
- [ ] Basic health endpoints respond

---

## **Step 1.2: Database Models & CSV Data Integration**
**Duration**: 2 days  
**Deliverables**: Pydantic models matching your CSV structure + data loading

### **1.2.1 Create Pydantic Models from CSV Structure**
Based on your CSV files, create exact models:

```python
# backend/app/models/components.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CategoryKey(str, Enum):
    BATHROOM_FIXTURES = "BATHROOM_FIXTURES"
    CHASSIS = "CHASSIS"
    CLOSET_STORAGE = "CLOSET_STORAGE"
    DOMOTICS = "DOMOTICS"
    DOORS = "DOORS"
    ELECTRICAL_SYSTEM = "ELECTRICAL_SYSTEM"
    ENERGY = "ENERGY"
    ENVELOPE = "ENVELOPE"
    FASTENERS = "FASTENERS"
    FINISHES = "FINISHES"
    FLOORS = "FLOORS"
    HVAC_SYSTEM = "HVAC_SYSTEM"
    INSULATION = "INSULATION"
    INTERIOR_FINISHES = "INTERIOR_FINISHES"
    KITCHEN_FIXTURES = "KITCHEN_FIXTURES"
    KITCHEN_FURNITURE = "KITCHEN_FURNITURE"
    MEP = "MEP"
    PLUMBING_SANITARY_SYSTEM = "PLUMBING_SANITARY_SYSTEM"
    ROOF_COVERING = "ROOF_COVERING"
    SIP_PANELS = "SIP_PANELS"
    STAIRCASES = "STAIRCASES"
    WINDOWS = "WINDOWS"

class QualityTier(str, Enum):
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    STANDARD_FIXED = "STANDARD_FIXED"  # For Chassis & SIP_PANELS

class ComponentCatalog(BaseModel):
    component_id: str = Field(..., description="Unique component identifier")
    component_name: str
    category: CategoryKey
    subcategory: str
    manufacturer_name: Optional[str] = None
    model_name: Optional[str] = None
    component_description: Optional[str] = None
    material_description: Optional[str] = None
    local_price_basic: float
    local_price_standard: float
    local_price_premium: float
    currency: str = "USD"
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### **1.2.2 Create CSV Data Loading Scripts**
```python
# backend/scripts/seed_catalog.py
import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.components import ComponentCatalog
import os

async def load_component_catalog():
    """Load component catalog from CSV with validation"""
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    db = client.hausa_erp
    
    # Read CSV
    df = pd.read_csv("data/Component_Catalogue.csv")
    
    # Validate and load
    loaded_count = 0
    for _, row in df.iterrows():
        try:
            component = ComponentCatalog(**row.to_dict())
            await db.components.replace_one(
                {"component_id": component.component_id},
                component.dict(),
                upsert=True
            )
            loaded_count += 1
        except Exception as e:
            print(f"Error loading component {row.get('component_id')}: {e}")
    
    print(f"Loaded {loaded_count} components")
    client.close()

if __name__ == "__main__":
    asyncio.run(load_component_catalog())
```

**Validation Checkpoint 1.2**:
- [ ] All Pydantic models created matching CSV structure
- [ ] Data loading script works without errors
- [ ] Database contains correct number of records
- [ ] All 22 categories properly loaded

---

## **Step 1.3: Core Authentication & User Management**
**Duration**: 1 day  
**Deliverables**: JWT auth system with role-based access

### **1.3.1 Authentication Models**
```python
# backend/app/models/auth.py
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    USER = "USER"
    CUSTOMER = "CUSTOMER"

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### **1.3.2 Auth Endpoints**
```python
# backend/app/routers/auth.py
@router.post("/register")
async def register_user(user_data: UserCreate):
    # Implementation with password hashing, JWT generation

@router.post("/login")
async def login_user(credentials: UserLogin):
    # Implementation with JWT token response
```

**Validation Checkpoint 1.3**:
- [ ] User registration works
- [ ] Login returns valid JWT
- [ ] Protected endpoints require authentication
- [ ] Role-based access control functional

---

## **Step 1.4: Customer & CRM Foundation**
**Duration**: 2 days  
**Deliverables**: Complete customer management system

### **1.4.1 Customer Models**
```python
# backend/app/models/customers.py
class Customer(BaseModel):
    customer_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: Optional[str] = None
    contact_person: str
    email: EmailStr
    phone: Optional[str] = None
    billing_address: Address
    shipping_address: Optional[Address] = None
    customer_type: CustomerType = CustomerType.INDIVIDUAL
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomerContact(BaseModel):
    contact_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    name: str
    role: str
    email: EmailStr
    phone: Optional[str] = None
```

### **1.4.2 Customer API Endpoints**
```python
@router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    # Implementation

@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    # Implementation with full contact details
```

**Validation Checkpoint 1.4**:
- [ ] Customer CRUD operations work
- [ ] Multiple contacts per customer supported
- [ ] Address handling functional
- [ ] Customer search and filtering work

---

## **Step 1.5: Project Management Core**
**Duration**: 1 day  
**Deliverables**: Project lifecycle management

### **1.5.1 Project Models**
```python
# backend/app/models/projects.py
class ProjectStatus(str, Enum):
    LEAD = "LEAD"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Project(BaseModel):
    project_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_name: str
    customer_id: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.LEAD
    estimated_start_date: Optional[datetime] = None
    estimated_completion_date: Optional[datetime] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    location: Optional[str] = None
    project_manager_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Validation Checkpoint 1.5**:
- [ ] Project CRUD operations work
- [ ] Customer-project relationship functional
- [ ] Project status transitions work
- [ ] Timeline and budget tracking functional

---

# 📋 **PHASE 2: CAD INTEGRATION & BOM SYSTEM (Days 8-14)**

## **Step 2.1: BOM Data Models & Import System**
**Duration**: 2 days  
**Deliverables**: ArchiCAD BOM import pipeline

### **2.1.1 BOM Models**
```python
# backend/app/models/bom.py
class BOMItem(BaseModel):
    bom_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_model_id: str  # U2X2, U2X3, U3X2, U3X3, U4X2, U4X3
    component_name: str
    category: CategoryKey
    subcategory: str
    quantity: float
    unit_of_measure: str
    cad_material_id: Optional[str] = None
    specifications: Optional[str] = None
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### **2.1.2 ArchiCAD Import Pipeline**
```python
# backend/app/services/cad_import.py
class CADImportService:
    async def import_bom_from_file(self, file_path: str, home_model_id: str):
        """Import BOM from ArchiCAD export (CSV/Excel)"""
        # Validate file format
        # Parse data
        # Validate against 22-category system
        # Store with version control
        
    async def validate_categories(self, bom_data: List[dict]) -> List[dict]:
        """Ensure all categories match the 22-category system"""
        # Strict validation - reject unknown categories
```

**Validation Checkpoint 2.1**:
- [ ] BOM import from CSV/Excel works
- [ ] Category validation rejects invalid categories
- [ ] Version control for BOM changes
- [ ] Multiple models supported

---

## **Step 2.2: Component Mapping Engine**
**Duration**: 2 days  
**Deliverables**: Intelligent BOM-to-Catalog matching

### **2.2.1 Mapping Service**
```python
# backend/app/services/component_mapping.py
class ComponentMappingService:
    async def map_bom_to_catalog(self, bom_items: List[BOMItem]) -> List[QuoteLineItem]:
        """Map BOM items to component catalog with quality tier rules"""
        quote_items = []
        
        for bom_item in bom_items:
            catalog_match = await self.find_catalog_component(
                bom_item.category, 
                bom_item.subcategory
            )
            
            # Apply special rules for Chassis & SIP_PANELS
            if bom_item.category in [CategoryKey.CHASSIS, CategoryKey.SIP_PANELS]:
                quality_tier = QualityTier.STANDARD_FIXED
                price = catalog_match.local_price_standard
            else:
                quality_tier = QualityTier.BASIC  # Default
                price = catalog_match.local_price_basic
            
            quote_items.append(QuoteLineItem(
                bom_item=bom_item,
                catalog_component=catalog_match,
                quality_tier=quality_tier,
                unit_price=price,
                total_price=price * bom_item.quantity
            ))
        
        return quote_items
```

**Validation Checkpoint 2.2**:
- [ ] BOM-to-Catalog mapping works accurately
- [ ] Chassis & SIP_PANELS locked to Standard/Fixed
- [ ] Quality tier rules applied correctly
- [ ] Pricing calculations accurate

---

## **Step 2.3: Quote Generation Engine**
**Duration**: 2 days  
**Deliverables**: Automatic quote creation from BOM

### **2.3.1 Quote Models**
```python
# backend/app/models/quotes.py
class Quote(BaseModel):
    quote_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    bom_id: str
    quote_version: int = 1
    total_amount: float
    currency: str = "USD"
    status: QuoteStatus = QuoteStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuoteLineItem(BaseModel):
    line_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_id: str
    component_id: str
    component_name: str
    manufacturer_name: Optional[str] = None
    model_name: Optional[str] = None
    category: CategoryKey
    subcategory: str
    quantity: float
    quality_tier: QualityTier
    unit_price: float
    total_price: float
```

### **2.3.2 Quote Generation Service**
```python
# backend/app/services/quote_generation.py
class QuoteGenerationService:
    async def generate_quote_from_bom(self, project_id: str, bom_id: str) -> Quote:
        """Generate instant quote from imported BOM"""
        # Get BOM items
        # Map to components
        # Apply quality tier rules
        # Calculate totals
        # Create quote with line items
```

**Validation Checkpoint 2.3**:
- [ ] Instant quote generation from BOM works
- [ ] All line items include manufacturer/model info
- [ ] Quality tier display correct (Fixed notation for Chassis/SIPs)
- [ ] Quote versioning functional

---

## **Step 2.4: Quality Tier Management**
**Duration**: 1 day  
**Deliverables**: Interactive quality selection with real-time pricing

### **2.4.1 Quality Tier Service**
```python
# backend/app/services/quality_tiers.py
class QualityTierService:
    async def update_component_quality(self, quote_id: str, line_id: str, new_tier: QualityTier):
        """Update quality tier for component (if not fixed)"""
        # Validate tier change is allowed
        # Recalculate pricing
        # Update quote totals
        
    async def get_tier_comparison(self, component_id: str) -> dict:
        """Get pricing comparison across all tiers"""
        # Return Basic/Standard/Premium pricing options
```

**Validation Checkpoint 2.4**:
- [ ] Quality tier changes update pricing in real-time
- [ ] Chassis & SIP_PANELS cannot be changed (locked)
- [ ] Tier comparison shows price differences
- [ ] Quote totals recalculate correctly

---

# 📋 **TRACKING & VALIDATION SYSTEM**

## **Implementation Tracker Template**
I'll maintain this after each step:

```markdown
# HAÜSA ERP IMPLEMENTATION STATUS

## Current Status
- **Phase**: 1 - Foundation Architecture
- **Step**: 1.2 - Database Models & CSV Integration
- **Progress**: 15% Complete
- **Last Validation**: Step 1.1 ✅ PASSED

## Completed Steps
- [x] 1.1 - Project Structure & Environment Setup
- [ ] 1.2 - Database Models & CSV Integration (IN PROGRESS)
- [ ] 1.3 - Core Authentication & User Management
- [ ] 1.4 - Customer & CRM Foundation
- [ ] 1.5 - Project Management Core

## Next Steps
1. Complete Pydantic models for all CSV data
2. Implement data loading scripts
3. Validate data integrity

## Blockers/Issues
- None currently

## Validation Results
### Step 1.1 Validation ✅
- Project structure created: ✅
- Dependencies installed: ✅
- Both apps start: ✅
- Health endpoints respond: ✅

## Files Created This Step
- backend/app/models/components.py
- backend/scripts/seed_catalog.py
- CSV loading validation script
```

## **Validation Protocol**
After **every single step**, I will:

1. **Show Proof**: Code snippets, test results, file listings
2. **Request Validation**: Ask you to confirm step completion
3. **Update Tracker**: Document progress and next steps
4. **Wait for Approval**: Don't proceed without your explicit approval

## **Deviation Prevention**
- 🔒 **Scope Lock**: No features outside your specification
- 🔒 **Step Lock**: Must complete current step before proceeding
- 🔒 **Validation Lock**: Must pass validation before continuing
