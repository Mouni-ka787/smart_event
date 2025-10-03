import { Request, Response } from 'express';
import { 
  getPersonalizedRecommendations,
  getRecommendationsBasedOnHistory,
  getTrendingServices,
  getPriceOptimizationSuggestions
} from '../utils/aiRecommendations';

// @desc    Get personalized service recommendations for user
// @route   GET /api/ai/recommendations/personalized
// @access  Private/User
export const getPersonalizedServiceRecommendations = async (req: Request, res: Response) => {
  try {
    const { categories, budgetMin, budgetMax } = req.query;
    
    const preferences = {
      categories: categories ? (Array.isArray(categories) ? categories : [categories]) : undefined,
      budgetRange: budgetMin || budgetMax ? {
        min: Number(budgetMin) || 0,
        max: Number(budgetMax) || Number.MAX_SAFE_INTEGER
      } : undefined
    };
    
    const recommendations = await getPersonalizedRecommendations(
      req.user?._id.toString() || 'anonymous',
      preferences as any
    );
    
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommendations based on user's booking history
// @route   GET /api/ai/recommendations/history
// @access  Private/User
export const getHistoryBasedRecommendations = async (req: Request, res: Response) => {
  try {
    const { categories } = req.query;
    
    const previousCategories = categories 
      ? (Array.isArray(categories) ? categories : [categories]) 
      : [];
    
    const recommendations = await getRecommendationsBasedOnHistory(
      req.user?._id.toString() || 'anonymous',
      previousCategories as string[]
    );
    
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending services (for admin dashboard)
// @route   GET /api/ai/recommendations/trending
// @access  Private/Admin
export const getTrendingServiceRecommendations = async (req: Request, res: Response) => {
  try {
    const recommendations = await getTrendingServices();
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get price optimization suggestions for vendors
// @route   GET /api/ai/pricing/suggestions
// @access  Private/Vendor
export const getPriceOptimization = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'Service category is required' });
    }
    
    const suggestions = await getPriceOptimizationSuggestions(
      req.user?._id.toString() || 'anonymous',
      category as string
    );
    
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};