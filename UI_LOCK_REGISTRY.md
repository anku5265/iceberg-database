# Iceberg DB — UI Lock Registry (Demo -> Production Workflow)

> **Rule:**
> 1. All new UI work happens ONLY in the **Demo Environment** (`http://localhost:5173`). Live Production (`https://icebergdb.in`) is **NEVER** touched until Ankush explicitly approves pushing to production.
> 2. Once Ankush marks any section or page as **DONE & LOCKED 🔒**, that file/section is permanently locked and must never be modified again without explicit unlock permission.

## Current Status
- **Production (`https://icebergdb.in`):** Homepage + Navbar + Footer Approved & Locked 🔒 (2026-11-10)
- **Locked Backup Copy:** `d:\icebergdb\iceberg-landing\src_saved_versions\HomePageNew_locked_production.jsx`
- **Demo (`http://localhost:5173`):** Synced with Live Production

## Section Lock Table
| Step | Section / Page | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Step 1** | **Navbar (`src/components/Navbar.jsx`)** | 🔒 **LOCKED** | 1220px architectural grid rails + 5-cell segmented action bar + Pure Crisp Ice-White CTA |
| **Step 2** | **Homepage (`src/HomePageNew.jsx`)** | 🔒 **LOCKED** | Hero (Glacial Cyan + Ice-White CTA + Sonar Wave Iceberg Emblem) + 12-Language Strip + 14-Tab Code Block (Blue Hover Glow) + Compact 9-Capability Spec Ledger + Agent Memory Split Frame + 3-Step Architecture Frame + Final CTA Frame (Pricing removed from Homepage) |
| **Step 3** | **Footer (`src/components/Footer.jsx`)** | 🔒 **LOCKED** | 1220px unbroken architectural rails + status pill + sharp 4-cell social bar + 4-column hairline link matrix |
| **Step 4** | **Inner Pages (`/pricing`, `/product/*`, `/docs`, `/benchmarks`, `/about`)** | ⏳ Next | Ready when Ankush requests inner page updates |
