import { kv } from '@vercel/kv';

const botToken = "8023396787:AAEmT-NyUHKWHQgzZsgeji2BpYkN0fNQjJI";
const telegramUrl = `https://api.telegram.org/bot${botToken}`;

export default async function handler(req, res) {
    // 1. تأكيد استلام الرسالة لتجنب تكرار إرسالها من تليجرام
    if (req.method !== 'POST') {
        return res.status(200).send('Bot is running');
    }

    try {
        const update = req.body;
        if (!update) return res.status(200).send('No body');

        console.log("Incoming update:", JSON.stringify(update));

        if (update.callback_query) {
            await handleCallback(update.callback_query);
        } else if (update.message) {
            await handleMessage(update.message);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error("Error in handler:", error);
        // دائماً نرسل 200 لتجنب "Webhook blocking" من تليجرام
        return res.status(200).send('OK with Error');
    }
}

async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    if (text === "/start") {
        await sendMainKeyboard(chatId);
    } else if (text.startsWith("/add")) {
        await processAdd(chatId, text);
    } else {
        await sendMessage(chatId, "🎮 أهلاً بك في لوحة تحكم الموقع!\nإليك الخيارات المتاحة:");
        await sendMainKeyboard(chatId);
    }
}

async function handleCallback(query) {
    const chatId = query.message.chat.id;
    const data = query.data;
    const callbackId = query.id;

    try {
        if (data === "list_projects") {
            await listProjects(chatId);
        } else if (data === "add_info") {
            await sendMessage(chatId, "➕ لإضافة موقع، أرسل البيانات بهذا التنسيق:\n\n `/add الاسم السعر الوصف رابط_الصورة رابط_المعاينة` \n\n *(تأكد من وجود مسافة واحدة بين كل معلومة)*");
        } else if (data.startsWith("del_")) {
            const id = data.replace("del_", "");
            await deleteProject(chatId, id);
        }

        // إغلاق حالة التحميل في تليجرام
        await fetch(`${telegramUrl}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackId })
        });
    } catch (e) {
        console.error("Callback error:", e);
    }
}

async function listProjects(chatId) {
    try {
        const projects = await kv.get('projects') || [];
        if (projects.length === 0) {
            await sendMessage(chatId, "📭 لا توجد مواقع حالياً في Marketplace.");
            return;
        }

        await sendMessage(chatId, "📋 قائمة المواقع الحالية:");

        for (const p of projects) {
            const keyboard = {
                inline_keyboard: [[{ text: "🗑 حذف", callback_data: `del_${p.id}` }]]
            };
            await sendMessage(chatId, `📍 *${p.title}*\n💰 ${p.price}\n🔢 ID: ${p.id}`, keyboard);
        }
    } catch (e) {
        await sendMessage(chatId, "❌ فشل الحصول على البيانات. تأكد من إعداد Vercel KV.");
    }
}

async function processAdd(chatId, text) {
    const parts = text.split(" ");
    if (parts.length < 6) {
        await sendMessage(chatId, "❌ خطأ في التنسيق! أرسل:\n/add الاسم السعر الوصف الصورة المعاينة");
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

    try {
        const projects = await kv.get('projects') || [];
        projects.push(newProject);
        await kv.set('projects', projects);

        await sendMessage(chatId, "✅ تم إضافة الموقع بنجاح!");
        await sendMainKeyboard(chatId);
    } catch (e) {
        await sendMessage(chatId, "❌ حدث خطأ أثناء الحفظ في KV.");
    }
}

async function deleteProject(chatId, id) {
    try {
        let projects = await kv.get('projects') || [];
        projects = projects.filter(p => p.id !== id);
        await kv.set('projects', projects);
        await sendMessage(chatId, "🗑 تم الحذف بنجاح.");
    } catch (e) {
        await sendMessage(chatId, "❌ فشل الحذف.");
    }
}

async function sendMainKeyboard(chatId) {
    const keyboard = {
        inline_keyboard: [
            [{ text: "➕ إضافة موقع جديد", callback_data: "add_info" }],
            [{ text: "📋 عرض وحذف المواقع", callback_data: "list_projects" }]
        ]
    };
    await sendMessage(chatId, "🎮 لوحة تحكم Vercel Marketplace", keyboard);
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

