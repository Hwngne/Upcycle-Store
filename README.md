# UpcycleStore

**UpcycleStore** is a university software project developed for Van Lang
University. The system combines a mobile application, an Admin Web
Platform, a backend API, and an AI waste-classification service.

## 🎯 Project Objectives

-   Raise awareness about environmental protection and waste
    classification.
-   Help students identify waste using AI image analysis.
-   Encourage participation through a reward-point system.
-   Support club events through QR-based check-in.
-   Provide administrators with tools to manage waste-related data.
-   Build a community for sharing recycled products and environmental
    knowledge.

## 🏗️ System Components

``` text
UpcycleStore
├── Mobile Application
│   └── Flutter / Dart
├── Admin Web
│   └── React
├── Backend
│   └── Node.js / Express
├── Database
│   └── MongoDB
└── AI Backend
    └── Python / FastAPI / Gemini API
```

## 📱 Mobile Application

### Authentication

-   Login with email and password
-   First-time login and change password
-   Forgot password and 6-digit OTP
-   Resend OTP
-   Password policy validation
-   Remember Me / session persistence
-   Logout

### AI Waste Classification

Users can: - Grant camera permission - Capture a waste image - Retake or
use the captured image - Crop an image - Upload one image from Gallery -
Classify the image using AI

The AI result contains: - Waste Name - Waste Group - Recommended Bin -
Handling Instruction - Confidence Score

The application also handles timeout, network failure, AI failure, and
unrecognized images.

### Reward Point

Users can receive points after eligible activities.

For AI classification, points are **not added automatically**. After a
successful classification, the user must select **Get Point** to receive
the reward.

### Classification History

The application stores classification information including: -
Classified image - Waste name - Waste group - Confidence score -
Classification date and time

### CLB Event & QR Check-in

The project includes QR-based event participation:

``` text
Event
  ↓
Generate QR
  ↓
Student scans QR
  ↓
QR validation
  ↓
Successful check-in
  ↓
Participant list updated
  ↓
Reward point updated
```

Duplicate, invalid, and expired QR scenarios are considered in testing.

## 🖥️ Admin Web Platform

The Admin platform supports waste category management: - Create waste
category - Update waste category - Delete waste category - Validate
required information - Manage waste classification data

## 🤖 AI Classification Flow

``` text
Capture / Upload Image
        ↓
Mobile Application
        ↓
AI Backend API
        ↓
Gemini API
        ↓
Waste Classification
        ↓
Result returned to Application
```

## 🧪 QA Testing Portfolio

This project is also used as a **QA Testing Portfolio**.

Testing activities include: - Requirement Analysis - Test Planning -
Test Case Design - Functional Testing - Positive Testing - Negative
Testing - Exploratory Testing - Regression Testing - End-to-End
Testing - Mobile Testing - UI Validation - API Testing preparation -
Database Validation preparation - Defect Reporting - Test Execution
Reporting

### Main QA Modules

  Module                   Testing Focus
  ------------------------ --------------------------------------------------------
  Login                    Authentication, first login, password, OTP and session
  Camera AI                Permission, capture, crop, upload and classification
  Reward Point             Point calculation and duplicate prevention
  Classification History   Saving and displaying classification data
  CLB Event                Event participation and QR check-in
  Admin Waste Category     Create, update and delete waste categories

## 📋 QA Artifacts

The QA portfolio is organized as:

``` text
QA-Portfolio-UpcycleStore/
├── README.md
├── 01_Test_Plan_UpcycleStore.docx
├── 02_Test_Cases_UpcycleStore.xlsx
├── 03_Bug_Report_Samples.docx
└── screenshots/
```

### Test Plan

Defines testing objectives, scope, test approach, environment,
deliverables, entry/exit criteria, and risks.

### Test Cases

Each test case contains: - Test Case ID - Module - Title -
Precondition - Test Steps - Test Data - Expected Result - Actual
Result - Status - Priority - Severity

A dashboard is used to monitor total cases, Passed, Failed, Blocked, Not
Run, overall progress, and module-level progress.

### Bug Reports

Defects contain: - Bug ID - Related Test Case ID - Module - Bug Title -
Environment - Preconditions - Steps to Reproduce - Actual Result -
Expected Result - Severity - Priority - Status - Attachment - Notes

Example defect areas include image upload, AI result, reward points,
classification history, and Admin waste categories.

## 🛠️ Technologies

### Development

-   Flutter / Dart
-   React / JavaScript
-   Node.js / Express
-   MongoDB
-   Python / FastAPI
-   Gemini API

### QA & Development Tools

-   Visual Studio Code
-   Figma
-   Postman
-   Chrome DevTools
-   Microsoft Excel
-   Microsoft Word
-   Git / GitHub
-   Selenium

## 📂 Repository Structure

``` text
Upcycle-Store/
├── FE_app_mobile/
├── frontend/
├── backend/
├── ai_backend/
├── .vscode/
└── start_ai.bat.txt
```

## 📚 Learning Outcomes

This project provided practical experience in: - Requirement analysis -
Business-flow analysis - Test scenario and test case design - Manual
testing - Negative and exploratory testing - Bug reporting - Regression
testing - Mobile application testing - UI validation against Figma - API
testing preparation - SQL/database validation preparation - Git/GitHub
workflow - Testing a multi-component software system

## 👨‍💻 Author

**Bùi Quốc Hưng**

Final-year Information Technology Student\
QA-Oriented / Aspiring QA Engineer

### QA Skills

-   Manual Testing
-   Functional Testing
-   Test Case Design
-   Bug Reporting
-   Exploratory Testing
-   Regression Testing
-   API Testing -- Postman
-   SQL
-   Selenium
-   Figma
-   Git / GitHub

## 📌 Project Status

The main development and current testing scope have been implemented. QA
documentation is being refined with test evidence, execution results,
defect reports, and test summaries.
