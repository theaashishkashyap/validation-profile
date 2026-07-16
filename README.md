# User Validation Module

A responsive, responsive, full-stack identity verification web application. Built with a Python + FastAPI backend querying a SQL database via SQLAlchemy ORM, and a modern vanilla HTML/CSS/JS frontend featuring a glassmorphic dark-theme design.

---

## Features

- **Real-Time Client Validation**: Matches backend validation rules (syntax check for email addresses and exactly 10 digits for phone numbers) directly in the browser as the user types.
- **Glassmorphic Card UI**: Sleek, modern dark mode design with glowing ambient backgrounds and smooth input focus indicators.
- **Micro-Animations**: Custom CSS animations for loaders and responsive validation check/cross SVGs.
- **FastAPI Backend Validation**: Strict validation filters return HTTP 422 for form failures.
- **ORM Integration**: Flexible database support that works with both PostgreSQL and SQLite.
- **Secure Error Shielding**: Shielded from leaking internal server stack traces to client.

---

## Directory Structure

```
/
├── backend/
│   ├── .env.example       # Example env variables
│   ├── .env               # Active env variables (ignored by Git)
│   ├── database.py        # SQLAlchemy configuration & path resolution
│   ├── models.py          # SQLAlchemy User schema
│   ├── main.py            # FastAPI service endpoints
│   ├── seed.py            # Database schema creations & initial inserts
│   └── requirements.txt   # Pinned Python package dependencies
├── frontend/
│   ├── index.html         # User validation form page
│   ├── result.html        # Verification result page (success/failure)
│   ├── style.css          # Core layout & styling sheets (glassmorphism/mobile responsive)
│   └── script.js          # Interactive JavaScript, Fetch requests & client-side validation
├── .gitignore             # Git ignored paths template
└── README.md              # Project documentation
```

---

## Getting Started

### 1. Prerequisites
Make sure you have **Python 3.12+** installed on your system.

### 2. Setting Up the Virtual Environment
Navigate to the root directory and run:

```bash
# Create a virtual environment
python -m venv venv

# Activate it on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Or on macOS/Linux
source venv/bin/activate

# Install the dependencies
pip install -r backend/requirements.txt
```

### 3. Database Configuration & Seeding
By default, the application is configured to run on a local SQLite database (`test.db`) for quick testing.

To initialize the schema and populate the test data:
```bash
python backend/seed.py
```

*Note: To connect to a live PostgreSQL instance instead, open the `backend/.env` file, uncomment the PostgreSQL URL, update your credentials, and re-run the seed script.*

### 4. Running the Servers

#### Start the Backend API Server:
Run this command from the `backend/` directory:
```bash
cd backend
..\venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8000
```
The API server will start listening at `http://127.0.0.1:8000`.

#### Serve the Frontend:
From the project root directory, run:
```bash
python -m http.server 3000 --directory frontend
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## Demo Credentials for Testing

Use the following seeded credentials to verify the validation states:

| Name | Email | Phone Number | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Aashish Kumar** | ash1@gmail.com | 8399279379 | **Success** (Passes check) |
| **Aashish Kashyap** | ash2@gmail.com | 6383638373 | **Success** (Passes check) |
| *Any other details* | *Valid format* | *10 digits* | **Failure** (Incorrect credentials) |
| *Invalid Email/Phone* | *invalid-format* | *12345* | **Form Error** (Fails inline checks) |
