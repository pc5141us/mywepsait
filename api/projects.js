import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const projects = await kv.get('projects') || [];
        return res.status(200).json(projects);
    }
    return res.status(405).end();
}
