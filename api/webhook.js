
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEES8VcO3gR-HjQvkyJKAfs4OmQDcS-YXG6p9hNDME7VJeOSDhD2qltFI0NPl0KIWNzQ/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Proxy OK. Bot is live and connected.');
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
