const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getStartDate = (range) => {
  const date = new Date();
  if (range === '7d') date.setDate(date.getDate() - 7);
  else if (range === '90d') date.setDate(date.getDate() - 90);
  else if (range === 'all') return new Date(0); // Epoch
  else date.setDate(date.getDate() - 30); // Default 30d
  date.setHours(0, 0, 0, 0);
  return date;
};

const generateDateList = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  // If 'all' is passed and the earliest date is very old, we don't want a massive array.
  // For 'all', we will trust the aggregation result and won't fill gaps, or we just fill from the earliest found date.
  // But wait, the requirements say "include days with zero activity as 0, don't skip them, so the chart isn't misleading".
  // If 'all' is selected, it's safer to start from the earliest date in the aggregation results. We'll handle this in the logic.
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// @desc    Get analytics for a specific seller
// @route   GET /api/seller/analytics
// @access  Private/Seller
const getSellerAnalytics = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const startDate = getStartDate(range);
    const sellerId = req.user._id;

    const matchStage = { createdAt: { $gte: startDate } };

    // Find all products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // If seller has no products, early return with zeros
    if (sellerProductIds.length === 0) {
      return res.json({
        summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, totalUnitsSold: 0 },
        revenueTrend: [],
        topProducts: [],
        categoryBreakdown: []
      });
    }

    // Pipeline for Orders
    const pipeline = [
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: { 'items.product': { $in: sellerProductIds } } }
    ];

    const results = await Order.aggregate([
      ...pipeline,
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: '$_id', // Group by order first to get unique orders
                orderRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
                unitsInOrder: { $sum: '$items.quantity' }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$orderRevenue' },
                totalOrders: { $count: {} },
                totalUnitsSold: { $sum: '$unitsInOrder' }
              }
            }
          ],
          revenueTrend: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  orderId: '$_id' // Group by date and order first to not count same order multiple times for total orders
                },
                orderRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                revenue: { $sum: '$orderRevenue' },
                orders: { $count: {} }
              }
            },
            { $sort: { _id: 1 } }
          ],
          topProducts: [
            {
              $group: {
                _id: '$items.product',
                unitsSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo'
              }
            },
            { $unwind: '$productInfo' },
            {
              $project: {
                productId: '$_id',
                name: '$productInfo.name',
                unitsSold: 1,
                revenue: 1,
                _id: 0
              }
            }
          ],
          categoryBreakdown: [
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
              }
            },
            { $unwind: '$productInfo' },
            {
              $lookup: {
                from: 'categories',
                localField: 'productInfo.category',
                foreignField: '_id',
                as: 'categoryInfo'
              }
            },
            { $unwind: '$categoryInfo' },
            {
              $group: {
                _id: '$categoryInfo.name',
                revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            }
          ],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 50 },
            {
              $lookup: {
                from: 'users',
                localField: 'buyer',
                foreignField: '_id',
                as: 'buyerInfo'
              }
            },
            { $unwind: '$buyerInfo' },
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
              }
            },
            { $unwind: '$productInfo' },
            {
              $project: {
                orderId: '$_id',
                buyerName: '$buyerInfo.name',
                productName: '$productInfo.name',
                quantity: '$items.quantity',
                revenue: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] },
                date: '$createdAt',
                _id: 0
              }
            }
          ]
        }
      }
    ]);

    const data = results[0];
    
    // Process Summary
    let summary = { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, totalUnitsSold: 0 };
    if (data.summary.length > 0) {
      const s = data.summary[0];
      summary.totalRevenue = s.totalRevenue;
      summary.totalOrders = s.totalOrders;
      summary.totalUnitsSold = s.totalUnitsSold;
      summary.averageOrderValue = s.totalOrders > 0 ? s.totalRevenue / s.totalOrders : 0;
    }

    // Process Trend (fill missing dates)
    let trend = [];
    if (data.revenueTrend.length > 0) {
      let actualStartDate = startDate;
      if (range === 'all') {
        actualStartDate = new Date(data.revenueTrend[0]._id);
      }
      
      const today = new Date();
      const dateList = generateDateList(actualStartDate, today);
      const trendMap = {};
      data.revenueTrend.forEach(t => { trendMap[t._id] = t; });

      trend = dateList.map(dateStr => ({
        date: dateStr,
        revenue: trendMap[dateStr] ? trendMap[dateStr].revenue : 0,
        orders: trendMap[dateStr] ? trendMap[dateStr].orders : 0
      }));
    } else if (range !== 'all') {
      const dateList = generateDateList(startDate, new Date());
      trend = dateList.map(dateStr => ({ date: dateStr, revenue: 0, orders: 0 }));
    }

    // Process Category Breakdown (calculate percentages)
    let categoryBreakdown = [];
    if (data.categoryBreakdown.length > 0) {
      const totalRev = summary.totalRevenue;
      categoryBreakdown = data.categoryBreakdown.map(c => ({
        category: c._id,
        revenue: c.revenue,
        percentage: totalRev > 0 ? ((c.revenue / totalRev) * 100).toFixed(2) : 0
      }));
    }

    res.json({
      summary,
      revenueTrend: trend,
      topProducts: data.topProducts,
      categoryBreakdown,
      recentOrders: data.recentOrders
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get global analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const startDate = getStartDate(range);

    const matchStage = { createdAt: { $gte: startDate } };

    // Get overall stats
    const totalUsers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();

    // Pipeline for Orders (Platform wide)
    const pipeline = [
      { $match: matchStage },
      { $unwind: '$items' }
    ];

    const results = await Order.aggregate([
      ...pipeline,
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: '$_id',
                orderRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$orderRevenue' },
                totalOrders: { $count: {} }
              }
            }
          ],
          revenueTrend: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  orderId: '$_id'
                },
                orderRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                revenue: { $sum: '$orderRevenue' },
                orders: { $count: {} }
              }
            },
            { $sort: { _id: 1 } }
          ],
          topProducts: [
            {
              $group: {
                _id: '$items.product',
                unitsSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo'
              }
            },
            { $unwind: '$productInfo' },
            {
              $lookup: {
                from: 'users',
                localField: 'productInfo.seller',
                foreignField: '_id',
                as: 'sellerInfo'
              }
            },
            { $unwind: '$sellerInfo' },
            {
              $project: {
                productId: '$_id',
                name: { $concat: ['$productInfo.name', ' (', '$sellerInfo.name', ')'] },
                unitsSold: 1,
                revenue: 1,
                _id: 0
              }
            }
          ],
          categoryBreakdown: [
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
              }
            },
            { $unwind: '$productInfo' },
            {
              $lookup: {
                from: 'categories',
                localField: 'productInfo.category',
                foreignField: '_id',
                as: 'categoryInfo'
              }
            },
            { $unwind: '$categoryInfo' },
            {
              $group: {
                _id: '$categoryInfo.name',
                revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
              }
            }
          ],
          topSellers: [
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
              }
            },
            { $unwind: '$productInfo' },
            {
              $group: {
                _id: '$productInfo.seller',
                revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
                uniqueOrders: { $addToSet: '$_id' } // use order ids to count distinct orders for this seller
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'sellerInfo'
              }
            },
            { $unwind: '$sellerInfo' },
            {
              $project: {
                sellerId: '$_id',
                sellerName: '$sellerInfo.name',
                revenue: 1,
                orderCount: { $size: '$uniqueOrders' },
                _id: 0
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    // User growth trend
    const userGrowthRaw = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newUsers: { $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] } },
          newSellers: { $sum: { $cond: [{ $eq: ['$role', 'seller'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = results[0];

    // Process Summary
    let summary = { 
      totalRevenue: 0, 
      totalOrders: 0, 
      totalUsers, 
      totalSellers, 
      totalProducts,
      averageOrderValue: 0 
    };
    
    if (data.summary.length > 0) {
      const s = data.summary[0];
      summary.totalRevenue = s.totalRevenue;
      summary.totalOrders = s.totalOrders;
      summary.averageOrderValue = s.totalOrders > 0 ? s.totalRevenue / s.totalOrders : 0;
    }

    // Process Trends (fill missing dates)
    let revenueTrend = [];
    let userGrowthTrend = [];
    
    let actualStartDate = startDate;
    if (range === 'all') {
      const earliestOrder = data.revenueTrend.length > 0 ? new Date(data.revenueTrend[0]._id) : new Date();
      const earliestUser = userGrowthRaw.length > 0 ? new Date(userGrowthRaw[0]._id) : new Date();
      actualStartDate = new Date(Math.min(earliestOrder, earliestUser));
    }
    
    const today = new Date();
    const dateList = generateDateList(actualStartDate, today);
    
    const revMap = {};
    data.revenueTrend.forEach(t => { revMap[t._id] = t; });
    
    const userMap = {};
    userGrowthRaw.forEach(t => { userMap[t._id] = t; });

    revenueTrend = dateList.map(dateStr => ({
      date: dateStr,
      revenue: revMap[dateStr] ? revMap[dateStr].revenue : 0,
      orders: revMap[dateStr] ? revMap[dateStr].orders : 0
    }));

    userGrowthTrend = dateList.map(dateStr => ({
      date: dateStr,
      newUsers: userMap[dateStr] ? userMap[dateStr].newUsers : 0,
      newSellers: userMap[dateStr] ? userMap[dateStr].newSellers : 0
    }));

    // Process Category Breakdown
    let categoryBreakdown = [];
    if (data.categoryBreakdown.length > 0) {
      const totalRev = summary.totalRevenue;
      categoryBreakdown = data.categoryBreakdown.map(c => ({
        category: c._id,
        revenue: c.revenue,
        percentage: totalRev > 0 ? ((c.revenue / totalRev) * 100).toFixed(2) : 0
      }));
    }

    // Fetch recent users
    const recentUsers = await User.find(matchStage)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('name email role createdAt');

    res.json({
      summary,
      revenueTrend,
      userGrowthTrend,
      topSellers: data.topSellers,
      topProducts: data.topProducts,
      categoryBreakdown,
      recentUsers
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSellerAnalytics,
  getAdminAnalytics
};
