### Architecture & Justification

**1. User Schema**
- **Embedded Address**: The `address` (`city`, `district`) is an embedded sub-document because a user typically has a single primary location in this context, making embedding highly efficient for fast read operations without needing a join (`$lookup`).
- **Role Enum**: The `role` enum (`buyer`, `seller`, `admin`) handles Role-Based Access Control (RBAC) efficiently within a single collection, avoiding the complexity of separate collections for different user types.
- **Lifecycle Hooks**: Implementing `bcrypt` in a Mongoose `pre-save` hook guarantees that passwords are automatically hashed before they ever reach the database, mitigating the risk of developer error elsewhere in the controller logic.

**2. Category Schema**
- **Standalone Collection**: Separated into its own collection to maintain strict consistency (avoiding typos across products) and to allow future scalability (such as adding subcategories or category images).
- **Slug Field**: The unique `slug` field enables clean, SEO-friendly, and human-readable URLs on the frontend (e.g., `/categories/fresh-produce`).

**3. Product Schema**
- **Normalized References**: Uses `ObjectId` references to `Category` and `User` (seller) so that updates to a seller's profile or a category name instantly reflect across all associated products.
- **Embedded Location**: Re-embedding `location` directly on the product ensures high-performance localized filtering—a critical feature for a *local* goods marketplace—without needing to constantly join the seller's profile.
- **Text Indexing**: The compound text index on `name` and `description` leverages MongoDB's native full-text search capabilities, providing robust keyword search out-of-the-box without requiring an external engine like Elasticsearch.
- **Soft Deletion (`isActive`)**: Allows administrators or sellers to hide a product without physically deleting it, maintaining referential integrity for historical orders that reference this product.

**4. Order Schema**
- **Snapshot Pattern**: The `items` array explicitly captures `priceAtPurchase`. This is a vital e-commerce pattern: it ensures that historical order totals and receipts remain perfectly accurate even if the seller updates the product price days later.
- **State Machine**: The `status` and `paymentStatus` enums enforce a strict state machine, preventing invalid business logic transitions (e.g., a "pending" payment shouldn't correspond to a "delivered" status).

**5. Review Schema**
- **Bucket/Reference Pattern**: Stored as an independent collection rather than an embedded array inside the `Product` document. This is crucial for scalability; embedding reviews can lead to unbounded array growth which ultimately breaches MongoDB's 16MB document limit and severely degrades query performance when fetching product details.
