import { kv } from '@vercel/kv';
import fetch from 'node-fetch';

const botToken = "8023396787:AAEmT-NyUHKWHQgzZsgeji2BpYkN0fNQjJI";
const telegramUrl = `https://api.telegram.org/bot${botToken}`;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const update = req.body;

    if (update.callback_query) {
        await handleCallback(update.callback_query);
    } else if (update.message) {
        await handleMessage(update.message);
    }

    return res.status(200).send('OK');
}

async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    if (text === "/start") {
        await sendMainKeyboard(chatId);
    } else if (text.startsWith("/add")) {
        await processAdd(chatId, text);
    } else {
        await sendMessage(chatId, "استخدم الأزرار للتحكم في الموقع:");
        await sendMainKeyboard(chatId);
    }
}

async function handleCallback(query) {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === "list_projects") {
        await listProjects(chatId);
    } else if (data === "add_info") {
        await sendMessage(chatId, "➕ لإضافة موقع، أرسل:\n`/add الاسم السعر الوصف رابط_الصورة رابط_المعاينة`\n\n*(تأكد من المسافات)*");
    } else if (data.startsWith("del_")) {
        const id = data.replace("del_", "");
        await deleteProject(chatId, id);
    }
}

async function listProjects(chatId) {
    const projects = await kv.get('projects') || [];
    if (projects.length === 0) {
        await sendMessage(chatId, "📭 لا توجد مواقع حالياً.");
        return;
    }

    for (const p of projects) {
        const keyboard = {
            inline_keyboard: [[{ text: "🗑 حذف", callback_data: `del_${p.id}` }]]
        };
        await sendMessage(chatId, `📍 *${p.title}*\n💰 ${p.price}\n🔢 ID: ${p.id}`, keyboard);
    }
}

async function processAdd(chatId, text) {
    const parts = text.split(" ");
    if (parts.length < 6) {
        await sendMessage(chatId, "❌ خطأ في التنسيق.");
        return;
    }

    const newProject = {
        id: "D" + Math.floor(Math.random() * 10000),
        title: parts[1],
        price: parts[2],
        description: parts[3],
        thumbnail: parts[4],
        previewUrl: parts[5]
    };

    const projects = await kv.get('projects') || [];
    projects.push(newProject);
    await kv.set('projects', projects);

    await sendMessage(chatId, "✅ تم الإضافة بنجاح!");
    await sendMainKeyboard(chatId);
}

async function deleteProject(chatId, id) {
    let projects = await kv.get('projects') || [];
    projects = projects.filter(p => p.id !== id);
    await kv.set('projects', projects);
    await sendMessage(chatId, "🗑 تم الحذف.");
}

async function sendMainKeyboard(chatId) {
    const keyboard = {
        inline_keyboard: [
            [{ text: "➕ إضافة موقع", callback_data: "add_info" }],
            [{ text: "📋 عرض المواقع", callback_data: "list_projects" }]
        ]
    };
    await sendMessage(chatId, "🎮 لوحة تحكم Vercel", keyboard);
}

async function sendMessage(chatId, text, keyboard = null) {
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
        reply_markup: keyboard ? JSON.stringify(keyboard) : undefined
    };
    await fetch(`${telegramUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
