### Architecture Justification: Advanced Aggregation for Dynamic Filtering

To implement the `GET /api/products` endpoint with keyword search, pagination, and dynamic filter generation, I opted to use a single **MongoDB Aggregation Pipeline utilizing the `$facet` stage** rather than executing multiple individual queries.

**The Problem with Multiple Queries:**
Typically, rendering a rich e-commerce listing page requires several data points:
1. The paginated list of products.
2. The total count of products (for frontend pagination logic).
3. The distinct categories, cities, and min/max prices available *based on the current search terms*.

If implemented natively with Mongoose `.find()` and `.distinct()` queries, this would require 4 to 5 separate roundtrips to the database. This drastically increases latency, wastes connection pool resources, and scales poorly under heavy load.

**The Aggregation Pipeline (`$facet`) Approach:**
To optimize this, I constructed a pipeline that processes everything in a single, highly performant database roundtrip:

1. **Pre-filtering (`$match` & `$text`)**: 
   - The pipeline first applies the `$text` search (which leverages the compound text index on name/description) and any active filters (like `minPrice`, `city`, `isActive`). This immediately narrows the working dataset down to only the relevant documents.

2. **The `$facet` Stage**:
   - Once the dataset is narrowed down, the `$facet` stage allows MongoDB to process multiple sub-pipelines on this exact same subset of data simultaneously.
   - **`products` facet**: Applies `$skip` and `$limit` for pagination, and executes `$lookup` stages (SQL-like joins) to attach the full Category and Seller details.
   - **`totalCount` facet**: Simply counts the documents matching the filters to inform the frontend's pagination controls.
   - **`filters` facet**: Uses `$group`, `$addToSet`, `$min`, and `$max` to dynamically compute the distinct categories, distinct cities, and the exact price range present in the *current result set*.

**Why this is crucial for UX:**
By calculating the available filters on the backend within the aggregation pipeline, the frontend can render dynamic filter sidebars (just like Amazon or Flipkart). If a user searches for "shoes," the API will only return cities that actually have shoes for sale. It completely prevents the frustrating UX anti-pattern where a user clicks a filter option only to be met with a "0 results found" page.
