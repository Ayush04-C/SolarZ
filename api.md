# Local Goods Marketplace API Documentation

Base URL: `http://localhost:5000`

---

## 1. Authentication API (`/api/auth`)

### Register a User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body** (`application/json`):
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "buyer",
    "phone": "1234567890",
    "address": {
      "city": "Springfield",
      "district": "Downtown"
    }
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "buyer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```
  *(Also sets `jwt` refresh token cookie)*

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body** (`application/json`):
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "buyer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```
  *(Also sets `jwt` refresh token cookie)*

### Get Current User Profile
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)
- **Response** (200 OK):
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "buyer",
    "phone": "1234567890",
    "address": {
      "city": "Springfield",
      "district": "Downtown"
    },
    "createdAt": "2024-05-19T10:00:00.000Z",
    "updatedAt": "2024-05-19T10:00:00.000Z"
  }
  ```

### Refresh Token
- **URL**: `/api/auth/refresh`
- **Method**: `POST`
- **Auth Required**: No (Reads `jwt` HTTP-Only Cookie)
- **Response** (200 OK):
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: No
- **Response** (200 OK):
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
  *(Clears the `jwt` refresh token cookie)*

---

## 2. Category API (`/api/categories`)

### Get All Categories
- **URL**: `/api/categories`
- **Method**: `GET`
- **Auth Required**: No
- **Response** (200 OK):
  ```json
  [
    {
      "_id": "60d0fe4f5311236168a109cb",
      "name": "Fresh Produce",
      "slug": "fresh-produce",
      "createdAt": "2024-05-19T10:00:00.000Z"
    }
  ]
  ```

### Create Category
- **URL**: `/api/categories`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Request Body** (`application/json`):
  ```json
  {
    "name": "Fresh Produce",
    "slug": "fresh-produce"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "_id": "60d0fe4f5311236168a109cb",
    "name": "Fresh Produce",
    "slug": "fresh-produce",
    "createdAt": "2024-05-19T10:00:00.000Z"
  }
  ```

---

## 3. Product API (`/api/products`)

### Create a Product
- **URL**: `/api/products`
- **Method**: `POST`
- **Auth Required**: Yes (Seller or Admin)
- **Request Type**: `multipart/form-data`
- **Form Data Fields**:
  - `name` (String)
  - `description` (String)
  - `price` (Number)
  - `stock` (Number)
  - `city` (String)
  - `district` (String)
  - `category` (ObjectId string)
  - `images` (File array, max 5)
- **Response** (201 Created):
  ```json
  {
    "_id": "60d0fe4f5311236168a109cc",
    "name": "Organic Apples",
    "description": "Freshly picked local apples.",
    "price": 5.99,
    "stock": 100,
    "location": {
      "city": "Springfield",
      "district": "Downtown"
    },
    "category": "60d0fe4f5311236168a109cb",
    "seller": "60d0fe4f5311236168a109ca",
    "images": [
      "/uploads/images-162423123.jpg"
    ],
    "isActive": true,
    "rating": 0,
    "numReviews": 0
  }
  ```

### Get All Products (With Filtering & Search)
- **URL**: `/api/products`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters (Optional)**:
  - `search` (String: keyword search)
  - `category` (ObjectId string)
  - `minPrice` (Number)
  - `maxPrice` (Number)
  - `city` (String)
  - `minRating` (Number)
  - `page` (Number: default 1)
  - `limit` (Number: default 10)
- **Response** (200 OK):
  ```json
  {
    "products": [
      {
        "_id": "60d0fe4f5311236168a109cc",
        "name": "Organic Apples",
        "price": 5.99,
        "category": {
           "_id": "60d0fe4f5311236168a109cb",
           "name": "Fresh Produce"
        },
        "seller": {
           "_id": "60d0fe4f5311236168a109ca",
           "name": "Jane Doe"
        }
      }
    ],
    "page": 1,
    "pages": 1,
    "total": 1,
    "availableFilters": {
      "categories": ["60d0fe4f5311236168a109cb"],
      "cities": ["Springfield"],
      "minAvailablePrice": 5.99,
      "maxAvailablePrice": 5.99
    }
  }
  ```

### Get "My Products"
- **URL**: `/api/products/mine`
- **Method**: `GET`
- **Auth Required**: Yes (Seller)
- **Response** (200 OK):
  ```json
  [
    {
      "_id": "60d0fe4f5311236168a109cc",
      "name": "Organic Apples",
      "price": 5.99,
      "isActive": true
    }
  ]
  ```

### Get Single Product
- **URL**: `/api/products/:id`
- **Method**: `GET`
- **Auth Required**: No
- **Response** (200 OK):
  ```json
  {
    "product": {
      "_id": "60d0fe4f5311236168a109cc",
      "name": "Organic Apples",
      "description": "Freshly picked local apples.",
      "price": 5.99,
      "category": {
        "_id": "60d0fe4f5311236168a109cb",
        "name": "Fresh Produce",
        "slug": "fresh-produce"
      },
      "seller": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe"
      }
    },
    "reviews": []
  }
  ```

### Update a Product
- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Owner Seller or Admin)
- **Request Type**: `multipart/form-data` OR `application/json`
- **Response** (200 OK): Returns the updated product object.

### Delete (Soft Delete) a Product
- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Owner Seller or Admin)
- **Response** (200 OK):
  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

---

## 4. Cart API (`/api/cart`)

### Get Current User's Cart
- **URL**: `/api/cart`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)
- **Response** (200 OK):
  ```json
  [
    {
      "product": {
        "_id": "60d0fe4f5311236168a109cc",
        "name": "Organic Apples",
        "price": 5.99,
        "images": ["/uploads/image.jpg"],
        "stock": 100
      },
      "quantity": 2,
      "_id": "60d0fe4f5311236168a109cd"
    }
  ]
  ```

### Add Item to Cart
- **URL**: `/api/cart`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Request Body** (`application/json`):
  ```json
  {
    "productId": "60d0fe4f5311236168a109cc",
    "quantity": 2
  }
  ```
- **Response** (201 Created): Returns the updated cart array.

### Update Cart Item Quantity
- **URL**: `/api/cart/:productId`
- **Method**: `PUT`
- **Auth Required**: Yes (Bearer Token)
- **Request Body** (`application/json`):
  ```json
  {
    "quantity": 5
  }
  ```
- **Response** (200 OK): Returns the updated cart array.

### Remove Item from Cart
- **URL**: `/api/cart/:productId`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)
- **Response** (200 OK): Returns the updated cart array.

---

## 5. Orders API (`/api/orders`)

### Checkout (Mock Payment)
- **URL**: `/api/orders/checkout`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Request Body** (`application/json`):
  ```json
  {
    "shippingAddress": "123 Main St, Springfield"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "_id": "60d0fe4f5311236168a109ce",
    "buyer": "60d0fe4f5311236168a109ca",
    "items": [
      {
        "product": "60d0fe4f5311236168a109cc",
        "quantity": 2,
        "priceAtPurchase": 5.99
      }
    ],
    "totalAmount": 11.98,
    "shippingAddress": "123 Main St, Springfield",
    "status": "pending",
    "paymentStatus": "mock_paid",
    "createdAt": "2024-05-19T10:00:00.000Z"
  }
  ```

### Get My Orders
- **URL**: `/api/orders`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)
- **Response** (200 OK): Returns an array of order objects belonging to the current user.

### Get Order by ID
- **URL**: `/api/orders/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Buyer/Seller involved or Admin)
- **Response** (200 OK): Returns the detailed order object.

---

## 6. Seller Dashboard API (`/api/seller`)

### Get Seller Orders
- **URL**: `/api/seller/orders`
- **Method**: `GET`
- **Auth Required**: Yes (Seller)
- **Response** (200 OK): Returns all orders containing products sold by this seller. Only includes the specific items in the order that belong to this seller.

### Get Seller Statistics
- **URL**: `/api/seller/stats`
- **Method**: `GET`
- **Auth Required**: Yes (Seller)
- **Response** (200 OK):
  ```json
  {
    "totalProducts": 15,
    "totalOrders": 42,
    "totalRevenue": 1250.50
  }
  ```

---

## 7. Admin Dashboard API (`/api/admin`)

### Get All Users
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Response** (200 OK): Returns an array of all users (passwords excluded).

### Get All Products
- **URL**: `/api/admin/products`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Response** (200 OK): Returns an array of all products, including inactive/deleted ones.

### Toggle Product Active Status (Moderate)
- **URL**: `/api/admin/products/:id/moderate`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Response** (200 OK): Returns the updated product object (e.g., `isActive: false`).

### Get All Orders
- **URL**: `/api/admin/orders`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Response** (200 OK): Returns an array of all orders across the platform.
