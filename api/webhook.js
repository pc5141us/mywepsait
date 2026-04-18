
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7CHJntQXgxj9M2V_c_s3iO-TaN5GRX29YboVdejzJXQOKVQ80eeV-0mgMw9d5e2AKVA/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Proxy is active and connected to Google Sheets.');
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
