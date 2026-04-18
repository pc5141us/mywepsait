
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7mYK3IzSTj88aPNh8ISL04dHqN9FyUSv-X4A2poj2KVQfT5rpDe_dSB16WZcdmO_Z5w/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Proxy is active and connected to the new Google Script.');
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
