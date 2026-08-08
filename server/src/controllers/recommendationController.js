const Product = require('../models/Product');
const { getRecommendations } = require('../utils/aiClient');

const getProductRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch source product
    const sourceProduct = await Product.findById(id).populate('category', 'name');
    if (!sourceProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Build candidate pool (same category OR price within ±30%, max 20)
    const minPrice = sourceProduct.price * 0.7;
    const maxPrice = sourceProduct.price * 1.3;

    const candidates = await Product.find({
      _id: { $ne: sourceProduct._id },
      isActive: true,
      $or: [
        { category: sourceProduct.category?._id || sourceProduct.category },
        { price: { $gte: minPrice, $lte: maxPrice } }
      ]
    })
      .populate('category', 'name')
      .limit(20)
      .lean();

    // 3. Attempt AI recommendations
    let aiRecs = null;
    if (candidates.length > 0) {
      aiRecs = await getRecommendations(sourceProduct, candidates);
    }

    // 4. Handle AI failure or disabled state
    let finalRecommendations = [];

    if (aiRecs && aiRecs.length > 0) {
      // Map AI returned IDs to full candidate product info
      finalRecommendations = aiRecs.map(rec => {
        const productData = candidates.find(c => c._id.toString() === rec.productId);
        if (!productData) return null;
        return {
          productId: productData._id,
          name: productData.name,
          price: productData.price,
          image: productData.images && productData.images.length > 0 ? productData.images[0] : null,
          reason: rec.reason
        };
      }).filter(p => p !== null); 
    } else {
      // Log for devs, return empty for consumers
      console.warn("[Recommendations] AI is missing, disabled, or failed. Returning empty recommendations.");
    }

    // 5. Send response
    res.json({
      source: sourceProduct._id,
      recommendations: finalRecommendations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductRecommendations
};
