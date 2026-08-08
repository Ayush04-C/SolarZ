# Local Goods Marketplace

A full-stack e-commerce marketplace enabling local buyers to discover and purchase goods from local sellers. The platform supports complex role-based access control, allowing three distinct types of users: Buyers, Sellers, and Administrators. 

## Tech Stack & Justification

- **Frontend:** React + Vite
  - *Justification:* React provides a robust component-based architecture for building a dynamic UI. Vite was chosen over Create React App or Webpack for its near-instant HMR (Hot Module Replacement) and incredibly fast build times, significantly speeding up development.
- **Backend:** Node.js + Express.js
  - *Justification:* Express is a minimalist and flexible Node.js web application framework that provides a robust set of features for web and mobile applications, perfectly suited for building RESTful APIs.
- **Database:** MongoDB + Mongoose (via MongoDB Atlas)
  - *Justification:* A NoSQL database provides the flexibility needed for dynamic product catalogs and nested documents (like reviews and cart items). Mongoose enforces schema validation at the application layer.
- **Authentication:** JWT (JSON Web Tokens)
  - *Justification:* Stateless authentication is scalable and works seamlessly between our decoupled frontend and backend.
- **State Management:** React Context API
  - *Justification:* Context API is built-in and perfectly sufficient for managing the global state (Authentication and Cart) without the heavy boilerplate of Redux.

## Test Credentials

For quick local testing across different roles, the database is seeded with the following accounts. All accounts share the same password: `password123`.

- **Admin Account:** `admin@localgoods.com`
- **Seller Account:** `sunny@localgoods.com` (Sunny Farms)
- **Buyer Account:** `alice@buyer.com` (Alice Buyer)

## Folder Structure

```
local-goods-marketplace/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/                # Axios configuration and API helpers
│   │   ├── components/         # Reusable UI components (ProductCard, Navbar)
│   │   ├── context/            # Global State (AuthContext, CartContext)
│   │   ├── pages/              # Route components (Cart, Checkout, Dashboards)
│   │   │   ├── admin/          # Admin specific pages
│   │   │   └── seller/         # Seller specific pages
│   │   ├── App.jsx             # Main router and app layout
│   │   └── index.css           # Global utility classes and styling
│   └── package.json
└── server/                     # Backend Application (Node + Express)
    ├── src/
    │   ├── controllers/        # Request handling logic
    │   ├── middleware/         # Auth and upload (Multer) middleware
    │   ├── models/             # Mongoose schemas (User, Product, Order)
    │   ├── routes/             # Express API routing definitions
    │   └── server.js           # Entry point and Express app configuration
    └── package.json
```

## Setup Instructions (Local Development)

### Prerequisites
- Node.js (v16+)
- MongoDB locally installed OR a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/local-goods-marketplace.git
cd local-goods-marketplace
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Copy the provided `.env.example` file to create your own `.env` file in the `server` directory:
```bash
cp .env.example .env
```
Open the `.env` file and fill in your actual values. Make sure to configure your AI API keys if you want to use the AI Product Recommendation feature:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/local_goods
JWT_SECRET=your_super_secret_key_here

# Ensure you add your real AI API key here!
AI_API_KEY=your_api_key_here
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

## API Endpoint Summary

### Authentication (`/api/auth`)
- `POST /register` - Register a new user (buyer/seller)
- `POST /login` - Authenticate user and receive JWT
- `GET /me` - Retrieve current logged-in user profile

### Products (`/api/products`)
- `GET /` - Fetch all active products (supports search, filter, pagination)
- `GET /:id` - Get details for a single product
- `POST /` - (Seller) Create a new product
- `PUT /:id` - (Seller/Admin) Update a product
- `DELETE /:id` - (Seller/Admin) Soft-delete a product

### Cart (`/api/cart`)
- `GET /` - Retrieve populated cart
- `POST /` - Add item to cart
- `PUT /:productId` - Update item quantity
- `DELETE /:productId` - Remove item from cart

### Orders (`/api/orders`)
- `POST /checkout` - Convert cart into an order and deduct stock
- `GET /mine` - Get order history for the logged-in user
- `GET /:id` - View details of a specific order

### Admin (`/api/admin`)
- `GET /dashboard/stats` - Platform-wide statistics
- `GET /users` - List all registered users
- `GET /products` - List all products (including inactive)
- `PUT /products/:id/moderate` - Toggle product active status
- `GET /orders` - View all platform transactions

## Known Limitations & Future Enhancements
Due to time constraints for the initial launch, the following features have been deferred to the future roadmap:
1. **Cloud Image Storage:** Currently, images are stored locally using `multer`. In a production environment, this should be migrated to **Cloudinary** or AWS S3 for scalable asset delivery.
2. **AI Recommendations (Completed):** Implementing a machine learning model to recommend products based on user browsing history and cart contents, powered by any OpenAI-compatible API.
3. **Voice Search:** Enhancing accessibility and UX by allowing users to search the catalog via voice input.
4. **Wishlist Feature:** Allowing users to save items for later without immediately adding them to their active shopping cart.
5. **Real-time Inventory Subscriptions:** Using WebSockets to dynamically grey out "Add to Cart" buttons if another user purchases the last item in stock.

## Bonus Features Implemented

### AI-Powered Product Recommendations
- Added a "You Might Also Like" section on each product details page, generated via an OpenAI-compatible AI API (configurable provider — works with OpenAI, Bharat Code, or any OpenAI-compatible endpoint via env vars: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_RECOMMENDATIONS_ENABLED`)
- Falls back gracefully to rule-based recommendations (same category / similar price) if the AI call fails or is disabled, so this feature can never break the product page
- Setup: see `server/.env.example` for required variables

### Voice Search
- Added a microphone button to the product search bar using the browser's native Web Speech API (no external API, no key required, zero cost)
- Supports Chrome/Edge fully, degrades gracefully (mic button hidden) on unsupported browsers like Firefox, so typed search always keeps working everywhere
- Recognized speech automatically populates the search field and triggers the existing search

### Regional Language Support
- Added a custom language switcher UI (English / हिन्दी / मराठी) in the navbar that seamlessly translates **all** content on the page—including both static UI text and dynamic database content like product names, descriptions, and user reviews.
- Implemented using the native Google Translate Web API via a `<GoogleTranslate />` component and custom dropdown, bypassing manual translation files and associated maintenance costs.
- Selected language persists perfectly across navigation and sessions by modifying the browser's `googtrans` cookie, avoiding all React virtual DOM unmount conflicts by cleanly reloading the DOM with the translation natively applied.
