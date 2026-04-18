
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTuCdJtMMOyXCHt5oQE6SJ4aFt6prQvRXP96i_7lE-u8GRPV9G6lO_pqTR81jQLsSa/exec";

export default async function handler(req, res) {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching from GAS:", error);
        return res.status(500).json({ error: "Failed to fetch data from Google Sheets" });
    }
}
