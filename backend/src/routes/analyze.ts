import { Router } from 'express';
import { analyzeRepairIssueStructured } from '../services/geminiService';
import { db, bucket } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { prompt, image, mimeType } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Image and mimeType are required' });
    }

    // Perform analysis first
    const result = await analyzeRepairIssueStructured(
      prompt || "Perform a professional engineering diagnostic analysis on this device image.",
      image,
      mimeType
    );

    // If bucket is configured, upload image and save metadata to Firestore
    if (process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
      try {
        const imageBuffer = Buffer.from(image, 'base64');
        const filename = `repairs/${uuidv4()}.${mimeType.split('/')[1] || 'png'}`;
        const file = bucket.file(filename);

        await file.save(imageBuffer, {
          metadata: { contentType: mimeType }
        });

        await db.collection('repairs').add({
          timestamp: new Date(),
          analysis: result,
          imagePath: filename,
          deviceName: result.deviceIdentification.name
        });
      } catch (uploadError) {
        console.warn('Metadata persistence failed, but analysis succeeded:', uploadError);
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

export default router;
