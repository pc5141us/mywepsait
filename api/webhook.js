
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTuCdJtMMOyXCHt5oQE6SJ4aFt6prQvRXP96i_7lE-u8GRPV9G6lO_pqTR81jQLsSa/exec";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Final Full System Proxy is live.');
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
