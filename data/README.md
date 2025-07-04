# Data Directory

This directory is for storing CSV and Excel files for the HAÜSA ERP system.

## Expected Files:

### Component Catalog
- **File**: `Component_Catalogue.csv`
- **Format**: CSV with columns matching the ComponentCatalog model
- **Purpose**: Master component catalog with pricing across quality tiers

### BOM (Bill of Materials) Files
- **Format**: Excel files (.xlsx)
- **Source**: ArchiCAD exports
- **Purpose**: BOM data for different home models (U2X2, U2X3, U3X2, U3X3, U4X2, U4X3)

## Structure:
```
data/
├── Component_Catalogue.csv
├── bom/
│   ├── U2X2_BOM.xlsx
│   ├── U2X3_BOM.xlsx
│   ├── U3X2_BOM.xlsx
│   ├── U3X3_BOM.xlsx
│   ├── U4X2_BOM.xlsx
│   └── U4X3_BOM.xlsx
└── README.md
```

## Upload Instructions:
1. Place your Component_Catalogue.csv file in this directory
2. Create a `bom/` subdirectory for BOM files
3. Upload BOM Excel files with descriptive names
4. The system will validate all data against the 22-category structure

## Categories (22 total):
1. BATHROOM_FIXTURES
2. CHASSIS
3. CLOSET_STORAGE
4. DOMOTICS
5. DOORS
6. ELECTRICAL_SYSTEM
7. ENERGY
8. ENVELOPE
9. FASTENERS
10. FINISHES
11. FLOORS
12. HVAC_SYSTEM
13. INSULATION
14. INTERIOR_FINISHES
15. KITCHEN_FIXTURES
16. KITCHEN_FURNITURE
17. MEP
18. PLUMBING_SANITARY_SYSTEM
19. ROOF_COVERING
20. SIP_PANELS
21. STAIRCASES
22. WINDOWS