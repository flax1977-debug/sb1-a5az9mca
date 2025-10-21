import express from 'express';
import multer from 'multer';
// import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer for PDF uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Mock Mistral AI processing function
const processPDFWithMistralAI = async (pdfText, filename) => {
  // Simulate Mistral AI processing
  // In real implementation, this would call Mistral AI API
  
  // Extract bank name from filename
  const bankName = filename.toLowerCase().includes('virgin') ? 'Virgin Card' : 
                   filename.toLowerCase().includes('chase') ? 'Chase' :
                   filename.toLowerCase().includes('amex') ? 'American Express' :
                   'Unknown Bank';
  
  // Mock extracted data based on virgin.pdf example
  if (filename.toLowerCase().includes('virgin')) {
    return {
      transactions: [
        {
          date: '2024-10-15',
          description: 'AMAZON PRIME MEMBERSHIP',
          amount: -8.99,
          category: 'Shopping'
        },
        {
          date: '2024-10-18',
          description: 'STARBUCKS COFFEE',
          amount: -4.85,
          category: 'Food & Dining'
        }
      ],
      summary: {
        balance: 3388.28,
        creditLimit: 5000.00,
        availableCredit: 1611.72,
        statementDate: '2024-10-20',
        dueDate: '2024-11-15'
      },
      bankInfo: {
        name: bankName,
        accountType: 'CREDIT'
      }
    };
  }
  
  // Default mock data for other PDFs
  return {
    transactions: [
      {
        date: '2024-10-20',
        description: 'Sample Transaction',
        amount: -25.00,
        category: 'Other'
      }
    ],
    summary: {
      balance: 1000.00,
      creditLimit: 2000.00,
      availableCredit: 1000.00,
      statementDate: '2024-10-20',
      dueDate: '2024-11-15'
    },
    bankInfo: {
      name: bankName,
      accountType: 'CREDIT'
    }
  };
};

// POST /api/pdf/process - Process uploaded PDF
router.post('/process', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;
    
    // Read PDF file (simplified for demo)
    const pdfBuffer = fs.readFileSync(filePath);
    
    // Process with Mistral AI (mocked) - using filename for processing
    const extractedData = await processPDFWithMistralAI('', filename);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      filename: filename,
      data: extractedData
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process PDF',
      details: error.message 
    });
  }
});

export default router;