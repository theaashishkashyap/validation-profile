from database import engine, SessionLocal, Base
from models import User

def seed_db():
    print("Checking/creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database already has users to avoid duplicate seeding
        # Clear existing users to replace with your custom demo data
        db.query(User).delete()
        
        print("Seeding database with sample users...")
        sample_users = [
            User(name="Aashish Kumar", email="ash1@gmail.com", phone="8399279379"),
            User(name="Aashish Kashyap", email="ash2@gmail.com", phone="6383638373")
        ]
        db.add_all(sample_users)
        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"An error occurred during database seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
