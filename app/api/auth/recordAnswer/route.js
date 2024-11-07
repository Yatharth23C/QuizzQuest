import { connectToDatabase } from '../../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, questionId, isCorrect } = req.body;

        try {
            const { db } = await connectToDatabase();
            const result = await db.collection('user_scores').insertOne({
                email,
                questionId,
                isCorrect,
                timestamp: new Date(),
            });

            res.status(200).json({ success: true, message: 'Answer recorded successfully', result });
        } catch (error) {
            console.error('Error recording answer:', error);
            res.status(500).json({ success: false, message: 'Failed to record answer' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
