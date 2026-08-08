const { OpenAI } = require('openai');

// Initialize the OpenAI client conditionally
let openai = null;
if (process.env.AI_API_KEY && process.env.AI_RECOMMENDATIONS_ENABLED === 'true') {
  openai = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL, 
  });
}

/**
 * Gets product recommendations using AI.
 * @param {Object} sourceProduct - The product to base recommendations on.
 * @param {Array} candidateProducts - A list of potential products to recommend.
 * @returns {Array|null} Array of recommended product objects with reasons, or null if disabled/failed.
 */
const getRecommendations = async (sourceProduct, candidateProducts) => {
  if (process.env.AI_RECOMMENDATIONS_ENABLED !== 'true' || !process.env.AI_API_KEY || !openai) {
    return null;
  }

  // Filter candidates to just essential info to keep payload small
  const smallCandidates = candidateProducts.map(p => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    category: p.category?.name || p.category,
    price: p.price
  }));

  const systemPrompt = `You are a product recommendation engine for a local goods marketplace. 
You will be provided with a source product and a list of candidate products in JSON format.
Select the top 4 most relevant candidate products to recommend based on similarity, complementarity, or use case.
Return ONLY a JSON array containing exactly 4 objects, each with:
- "productId" (the id of the recommended product)
- "reason" (a short one-sentence reason why it is recommended, e.g. "A perfect complementary item.")
Do not return any markdown wrapping, no conversational text, ONLY the raw JSON array.`;

  const userMessage = JSON.stringify({
    sourceProduct: {
      id: sourceProduct._id.toString(),
      name: sourceProduct.name,
      description: sourceProduct.description,
      category: sourceProduct.category?.name || sourceProduct.category,
      price: sourceProduct.price
    },
    candidateProducts: smallCandidates
  });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      timeout: 8000 // 8 second timeout
    });

    let resultText = response.choices[0].message.content.trim();
    
    // Defensive parsing in case the model wraps the JSON in markdown blocks
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsedResults = JSON.parse(resultText);

    if (!Array.isArray(parsedResults)) {
      throw new Error("AI did not return an array.");
    }

    // Validate that returned IDs actually exist in our candidates
    const validCandidateIds = new Set(smallCandidates.map(c => c.id));
    const validRecommendations = parsedResults.filter(rec => validCandidateIds.has(rec.productId));

    if (validRecommendations.length === 0) {
      throw new Error("AI returned no valid product IDs matching candidates.");
    }

    return validRecommendations.slice(0, 4); // Limit to top 4 max
  } catch (error) {
    console.warn(`[AI Recommendations Error] ${error.message}`);
    return null;
  }
};

module.exports = {
  getRecommendations
};
