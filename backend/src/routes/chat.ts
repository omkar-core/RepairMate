import { Router } from 'express';
import { chatWithRepairMate } from '../services/geminiService';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { history, message, image } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatWithRepairMate(history || [], message, image);

    res.json({ response });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get chat response' });
  }
});

export default router;
