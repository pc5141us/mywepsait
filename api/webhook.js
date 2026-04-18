
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzabtwCCZvdEXoF50nRtpiS8xLG6WtKSBLx_xwJUWTHysq26vRgEn7eTXj6gtpcjhL-5Q/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Final Admin System active with Edit support.');
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
