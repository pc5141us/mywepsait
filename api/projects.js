
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz30OTe6xWdGNDcOb9HjdvUJoZd3VERTabu_QGVLStv1NGjjdtyG54KT3oaF28zp--RyA/exec";

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
