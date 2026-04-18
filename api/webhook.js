
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxeYvNqKx5vbctkFaRysLYFLnoWsZy6j6Bq-bYE8k68f1gdHknwy_SagH9VpiWFkpQMaw/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Keyboard persistency Proxy is active.');
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
