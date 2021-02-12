import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

const articlesInfo = {
    'learn-react': { upvotes: 0, comments: [] },
    'learn-node': { upvotes: 0, comments: [] },
    'my-thoughts-on-resumes': { upvotes: 0, comments: [] },
};

const startServer = async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('react-blog-db-feb12');

    app.get('/api/articles/:name', async (req, res) => {
        const { name } = req.params;

        const info = await db.collection('articles').findOne({ name });

        if (info) {
            res.send(info);
        } else {
            res.sendStatus(404);
        }
    });

    app.post('/api/articles/:name/upvotes', async (req, res) => {
        const { name } = req.params;

        await db.collection('articles').updateOne(
            { name },
            { $inc: { upvotes: 1 } },
        );

        const updatedArticleInfo = await db.collection('articles').findOne({ name });
        res.send(updatedArticleInfo);
    });

    app.post('/api/articles/:name/comments', async (req, res) => {
        const { text, postedBy } = req.body;
        const { name } = req.params;

        await db.collection('articles').updateOne(
            { name },
            { $push: { comments: { text, postedBy } } }
        );

        const updatedArticleInfo = await db.collection('articles').findOne({ name });

        res.send(updatedArticleInfo);
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build/index.html'));
    });

    app.listen(8000, () => console.log('Server is listening on port 8000'));
}

startServer();