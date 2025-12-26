# LM Store Backend ⚙️

Powered by **FastAPI** and **SQLite**.

## 🛠️ Setup
1. **Create Virtual Environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
2. **Install Dependencies:**
   ```bash
   pip install fastapi uvicorn sqlite3 python-multipart python-jose[cryptography] passlib[bcrypt]
3. **Run Server:**
   ```bash
   uvicorn main:app --reload

## API Endpoints (Admin)

* `GET /api/admin/users` - Fetch user list (Auth required)
* `POST /api/admin/product` - Create new inventory
* `PUT /api/admin/product/{id}/restore` - Restore archived items
* `DELETE /api/admin/product/{id}` - Soft-delete items (sets is_active=0)
