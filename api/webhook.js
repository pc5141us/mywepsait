
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz30OTe6xWdGNDcOb9HjdvUJoZd3VERTabu_QGVLStv1NGjjdtyG54KT3oaF28zp--RyA/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Proxy OK. Connected to latest script.');
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
