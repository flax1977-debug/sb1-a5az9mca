import express from 'express';

const router = express.Router();

// Mock categories data - replace with actual database calls
const mockCategories = [
  { id: 1, name: 'Food & Dining', color: '#FF6B6B' },
  { id: 2, name: 'Transportation', color: '#4ECDC4' },
  { id: 3, name: 'Shopping', color: '#45B7D1' },
  { id: 4, name: 'Entertainment', color: '#96CEB4' },
  { id: 5, name: 'Bills & Utilities', color: '#FFEAA7' },
  { id: 6, name: 'Healthcare', color: '#DDA0DD' },
  { id: 7, name: 'Travel', color: '#98D8C8' },
  { id: 8, name: 'Other', color: '#F7DC6F' }
];

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    // In a real app, this would fetch from database
    // const categories = await prisma.category.findMany();
    res.json(mockCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    // In a real app, this would create in database
    const newCategory = {
      id: mockCategories.length + 1,
      name,
      color
    };
    
    mockCategories.push(newCategory);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;