# SnapQuote — Future Update Roadmap 🚀

> Current version: **v1.2.0**
> Next planned: **v1.3.0 → v2.0.0**

---

## 🏆 v1.3.0 — OTA Updates & Changelog System
*Target: Next release*

### Core Features
- [ ] **CodePush / OTA Update System** — Over-the-air JS bundle updates without Play Store
  - React Native CodePush integration (Microsoft App Center) ya custom OTA solution
  - Users get update notification on app open
  - Silent background download + apply on next launch
- [ ] **Update Changelog Screen**
  - Modal/screen showing what's new in the latest update
  - Version history viewer
  - "Sync Now" / "Update Now" button
- [ ] **Auto-update Check**
  - Check for updates on app launch
  - Optional auto-download on Wi-Fi
  - Update progress indicator

### UI/UX
- [ ] **New Challan System** — Redesigned challan UI with Liquid Glass aesthetic
- [ ] **Splash Screen Animation** — Animated logo with glass effect on startup
- [ ] **Empty State Illustrations** — Beautiful empty states for quotes, customers, etc.

---

## 📋 v1.4.0 — Quotation Enhancements
*Target: Next + 1*

- [ ] **Quotation Templates** — Save and reuse quotation templates
- [ ] **Bulk Quote Operations** — Select multiple quotes → delete/export/email
- [ ] **Quote Version History** — Track changes to each quotation
- [ ] **Custom PDF Branding** — Company logo, watermark, custom footer on PDF
- [ ] **Price Calculator** — Built-in calculator for quick price add
- [ ] **Discount & Tax Templates** — Save common discount/tax configurations
- [ ] **Multi-language Support** — Hindi + English toggle in-app

---

## ☁️ v1.5.0 — Cloud Sync & Backup
*Target: Next + 2*

- [ ] **Full Cloud Sync** — Seamless sync across devices via Firebase
  - Real-time sync toggle (auto/manual)
  - Conflict resolution UI
  - Sync status indicator
- [ ] **Cloud Backup** — Automatic daily backup to Firebase
  - Restore from backup on fresh install
  - Backup history viewer
- [ ] **Offline-first** — Full offline support with background sync when online
- [ ] **Google Drive Backup** — Optional backup to user's Google Drive
- [ ] **Export/Import** — Full data export (JSON/CSV) and import

---

## 🔐 v1.6.0 — Security & Auth
*Target: Next + 3*

- [ ] **Google Sign-in** — Login with Google account
- [ ] **Cloud Auth** — Firebase Authentication for multi-device sync
- [ ] **App Lock Improvements** — Pattern lock + PIN option (not just biometric)
- [ ] **Encrypted Local Storage** — SQLite encryption for sensitive data
- [ ] **Auto-lock Timer** — 30s/1min/5min auto-lock options
- [ ] **Data Privacy Mode** — Hide amounts on main screen

---

## 🎨 v2.0.0 — Major Redesign & Platform Expansion
*Target: Major milestone*

### iOS Support
- [ ] **iOS Build** — Full iOS support with Xcode project
- [ ] **iCloud Sync** — Optional iCloud backup
- [ ] **Apple Sign-in** — Sign in with Apple
- [ ] **Widgets** — iOS home screen widgets for quick quote access

### Enterprise Features
- [ ] **Multi-user / Team Mode** — Multiple users under one business account
  - Role-based access (Admin, Editor, Viewer)
  - Shared customer database
  - Team activity log
- [ ] **GST/Billing Compliance** — GST invoice format, HSN codes
- [ ] **Payment Tracking** — Track paid/unpaid/partial payments per quote
- [ ] **Email Integration** — Send quotes via email directly from app
- [ ] **WhatsApp Sharing** — One-tap quote share via WhatsApp

### UI Overhaul
- [ ] **Full Liquid Glass 2.0** — Enhanced glassmorphism with dynamic lighting
- [ ] **Custom Themes** — User-selectable color themes
- [ ] **Animations** — Page transitions, micro-interactions everywhere
- [ ] **Landscape Mode** — Full landscape support
- [ ] **Tablet Layout** — Optimized UI for tablets

---

## 📊 v2.1.0 — Analytics & Reports
*Target: Post v2.0*

- [ ] **Dashboard Analytics** — Monthly quote count, revenue trends, top customers
- [ ] **Report Generation** — Generate sales reports (PDF/Excel)
- [ ] **Charts & Graphs** — Visual data representation
- [ ] **Export Reports** — Email/share analytics reports

---

## 🔌 v2.2.0 — Integrations & API
*Target: Post v2.0*

- [ ] **REST API** — Public API for third-party integrations
- [ ] **Zapier Integration** — Connect with 1000+ apps
- [ ] **Print via Cloud** — Send to print from any device
- [ ] **Web Dashboard** — Basic web dashboard for desktop users
- [ ] **QR Code Payment Links** — UPI/GPay/PayTM QR on quotes

---

## 🛠️ Technical Debt & Improvements
*Ongoing across all versions*

- [ ] **Performance Optimization** — List virtualization, lazy loading
- [ ] **App Size Reduction** — Bundle splitting, image optimization
- [ ] **CI/CD Pipeline** — GitHub Actions for auto build + release
- [ ] **Automated Testing** — Unit tests, integration tests
- [ ] **Crash Reporting** — Sentry/Firebase Crashlytics integration
- [ ] **Analytics** — Firebase Analytics for usage insights
- [ ] **Push Notifications** — Firebase Cloud Messaging
- [ ] **Deep Linking** — Shareable quote links

---

## 📝 Version History

| Version | Date | Highlights |
|---------|------|------------|
| v1.0.0 | June 2026 | Initial Release — Liquid Glass UI, Quotations, Customers, Biometric Lock |
| v1.2.0 | June 2026 | Android Build System Fixes, GitHub Release, Android Source Tracked |
| v1.3.0 | TBD | OTA Updates, Changelog System, New Challan UI |
| v2.0.0 | TBD | iOS Support, Enterprise Features, Liquid Glass 2.0 |

---

*Plan last updated: June 2026*
