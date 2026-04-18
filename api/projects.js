
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7CHJntQXgxj9M2V_c_s3iO-TaN5GRX29YboVdejzJXQOKVQ80eeV-0mgMw9d5e2AKVA/exec";

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
