# PitBros — Sportswear E-Commerce v2

**Niche:** Premium T-Shirts, Tracksuits & Sport Shoes  
**Design:** Black & white editorial minimalism  
**Payment:** PayPal (+ Cash on Delivery fallback)

---

## Project Structure

```
pitbros/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # App factory + error handlers
│   │   ├── config.py             # Dev / Prod / Test configs
│   │   ├── extensions.py         # Flask extensions (db, jwt, bcrypt, cors…)
│   │   ├── models/
│   │   │   ├── user.py           # User + Address
│   │   │   ├── product.py        # Product + ProductVariant (sportswear niche)
│   │   │   ├── inventory.py      # Warehouse + StockLevel
│   │   │   ├── cart.py           # Cart + CartItem
│   │   │   ├── order.py          # Order + OrderLine
│   │   │   └── payment.py        # Payment (PayPal fields)
│   │   ├── routes/
│   │   │   ├── auth.py           # /api/auth/*
│   │   │   ├── profile.py        # /api/user/*
│   │   │   ├── products.py       # /api/products/*  (sportswear categories)
│   │   │   ├── cart.py           # /api/cart/*
│   │   │   ├── orders.py         # /api/orders/*
│   │   │   ├── payments.py       # /api/payments/* (PayPal + COD)
│   │   │   └── admin.py          # /api/admin/*
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── cart_service.py
│   │   │   ├── order_service.py
│   │   │   └── payment_service.py  # PayPal integration stub
│   │   └── middleware/
│   │       └── rbac.py           # @admin_required, @customer_required
│   ├── wsgi.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── user_login.html           # Login + register (split editorial layout)
    ├── user_landing.html         # Product catalog + hero + cart drawer
    ├── user_account.html         # Profile / orders / addresses
    ├── payment.html              # Checkout + PayPal / COD
    ├── admin_login.html          # Admin gate
    ├── admin_account.html        # Full admin dashboard
    ├── css/
    │   └── styles.css            # Complete design system (B&W editorial)
    └── js/
        ├── api.js                # HTTP client (JWT-aware fetch wrapper)
        ├── auth.js               # Auth state: tokens, user, guards, logout
        ├── cart.js               # Cart state, drawer, add/remove/update
        ├── ui.js                 # Toast, loading, alerts, tabs, formatters
        └── paypal.js             # PayPal JS SDK loader + button renderer
```

---

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set SECRET_KEY, JWT_SECRET_KEY, PAYPAL_CLIENT_ID etc.

flask --app wsgi db init
flask --app wsgi db migrate -m "initial schema"
flask --app wsgi db upgrade

flask --app wsgi run --debug
# API available at http://127.0.0.1:5000
```

### Create Admin User (Flask shell)

```bash
flask --app wsgi shell
```
