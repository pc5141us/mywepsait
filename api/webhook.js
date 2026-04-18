
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfD8LebAMn8WCuAy-Q6lRQLYQmsihXuzCN9pTjDR9WYdfEQ94JZByAU2bFN83bSq-m/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Proxy is active and connected to the latest Google Script.');
    }

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        return res.status(200).send('OK');
    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(200).send('Error but OK');
    }
}
