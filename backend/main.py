import re
from fastapi import FastAPI, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from database import get_db
from models import User
from pydantic import BaseModel, field_validator

app = FastAPI(title="User Validation API")

# Enable CORS for local and remote frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (e.g. Vercel, localhost)
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for Pydantic validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if errors:
        err = errors[0]
        # Construct field name from error location
        field = ".".join(str(loc) for loc in err.get("loc", []))
        if field.startswith("body."):
            field = field[5:]
        msg = err.get("msg", "invalid format")
        message = f"{field}: {msg}"
    else:
        message = "validation error"
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"valid": False, "message": message}
    )

# Input data schema
class UserValidateRequest(BaseModel):
    name: str
    email: str
    phone: str

# Email format check regex (RFC 5322-compliant basic validation)
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

@app.post("/api/validate-user")
def validate_user(request_data: UserValidateRequest, db: Session = Depends(get_db)):
    try:
        # Strip inputs to prevent white-space mismatch issues
        name = request_data.name.strip()
        email = request_data.email.strip()
        phone = request_data.phone.strip()

        # 1. Validate email format
        if not EMAIL_REGEX.match(email):
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"valid": False, "message": "email: Must be a syntactically valid email"}
            )

        # 2. Validate phone number is exactly 10 digits
        if not (len(phone) == 10 and phone.isdigit()):
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"valid": False, "message": "phone: Must be exactly 10 digits"}
            )

        # 3. Query the database for exact match
        user = db.query(User).filter(
            User.name == name,
            User.email == email,
            User.phone == phone
        ).first()

        # 4. Return results
        if user:
            return {"valid": True}
        else:
            return {"valid": False, "message": "Invalid user details"}

    except Exception as e:
        # Catch any unexpected errors (e.g. database connection down)
        # Log the actual stack trace/error on server stdout
        import traceback
        traceback.print_exc()
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"valid": False, "message": "Internal server error"}
        )

# Serve the static frontend files directly from the root path
import os
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
