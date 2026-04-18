const botToken = "8023396787:AAEmT-NyUHKWHQgzZsgeji2BpYkN0fNQjJI";
const telegramUrl = "https://api.telegram.org/bot" + botToken;

// 1. وظيفة لجلب البيانات للموقع (GET)
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var result = [];

  if (data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      result.push({
        id: data[i][0],
        title: data[i][1],
        description: data[i][2],
        price: data[i][3],
        thumbnail: data[i][4],
        previewUrl: data[i][5]
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. معالجة الرسائل والضغط على الأزرار (POST)
function doPost(e) {
  var update = JSON.parse(e.postData.contents);

  // معالجة الضغط على أزرار الكيبورد أونلاين
  if (update.callback_query) {
    handleCallback(update.callback_query);
    return;
  }

  // معالجة الرسائل النصية
  if (update.message) {
    handleMessage(update.message);
  }
}

// معالجة الرسائل
function handleMessage(msg) {
  var chatId = msg.chat.id;
  var text = msg.text || "";
  
  if (text == "/start" || text == "🔄 تحديث القائمة") {
    sendMainKeyboard(chatId);
  } else if (text == "🌐 عرض الموقع") {
    sendMessage(chatId, "🔗 يمكنك زيارة موقعنا من هنا:\n" + "https://your-vercel-domain.com");
  } else if (text == "➕ إضافة موقع جديد") {
    sendMessage(chatId, "➕ لإضافة موقع جديد، أرسل البيانات بهذا التنسيق في رسالة واحدة:\n\n`/add الاسم السعر الوصف رابط_الصورة رابط_المعاينة`\n\n*(تأكد من وجود مسافة واحدة بين كل معلومة)*");
  } else if (text == "📋 عرض وحذف المواقع") {
    listProjectsForControl(chatId);
  } else if (text.startsWith("/add")) {
    processAddRequest(chatId, text);
  } else if (text.startsWith("/edit_desc")) {
    processEditDesc(chatId, text);
  } else {
    sendMainKeyboard(chatId);
  }
}

// معالجة الضغط على الأزرار
function handleCallback(query) {
  var chatId = query.message.chat.id;
  var data = query.data;
  
  if (data == "main_menu") {
    sendMainKeyboard(chatId);
  } else if (data == "list_projects") {
    listProjectsForControl(chatId);
  } else if (data.startsWith("del_")) {
    var id = data.replace("del_", "");
    deleteProjectById(chatId, id);
  } else if (data.startsWith("pre_edit_")) {
    var id = data.replace("pre_edit_", "");
    sendMessage(chatId, "📝 لتعديل وصف هذا الموقع، أرسل الرسالة بالشكل التالي:\n\n`/edit_desc " + id + " الوصف الجديد هنا`\n\n*(انسخ الأمر وقم بتغيير النص فقط)*");
  }
  
  answerCallbackQuery(query.id);
}

// القائمة الرئيسية (Reply Keyboard)
function sendMainKeyboard(chatId) {
  var keyboard = {
    keyboard: [
      [{ text: "🌐 عرض الموقع" }],
      [{ text: "➕ إضافة موقع جديد" }, { text: "📋 عرض وحذف المواقع" }],
      [{ text: "🔄 تحديث القائمة" }]
    ],
    resize_keyboard: true,
    persistent: true
  };
  sendKeyboard(chatId, "🎮 لوحة تحكم Doma Designs\nأهلاً بك! استخدم الكيبورد أدناه للتحكم السريع:", keyboard);
}

// عرض المواقع مع أزرار التحكم
function listProjectsForControl(chatId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    sendMessage(chatId, "📭 لا توجد مواقع معروضة حالياً.");
    sendMainKeyboard(chatId);
    return;
  }

  sendMessage(chatId, "🔎 إليك قائمة بكل المواقع المعروضة:");

  for (var i = 1; i < data.length; i++) {
    var id = data[i][0];
    var title = data[i][1];
    var price = data[i][3];
    
    var keyboard = {
      inline_keyboard: [
        [
          { text: "📝 تعديل الوصف", callback_data: "pre_edit_" + id },
          { text: "🗑 حذف", callback_data: "del_" + id }
        ]
      ]
    };
    
    sendKeyboard(chatId, "📍 *" + title + "*\n💰 السعر: " + price + "\n🔢 ID: " + id, keyboard);
  }
}

// حذف موقع
function deleteProjectById(chatId, id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var found = false;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      found = true;
      break;
    }
  }

  if (found) {
    sendMessage(chatId, "✅ تم حذف الموقع بنجاح.");
    listProjectsForControl(chatId); // عرض القائمة المحدثة
  } else {
    sendMessage(chatId, "❌ لم يتم العثور على هذا الموقع.");
  }
}

// تشغيل إضافة موقع
function processAddRequest(chatId, text) {
  var parts = text.split(" ");
  if (parts.length < 6) {
    sendMessage(chatId, "❌ خطأ! التنسيق الصحيح:\n/add الاسم السعر الوصف رابط_الصورة رابط_المعاينة");
  } else {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var id = "D" + Math.floor(Math.random() * 10000);
    sheet.appendRow([id, parts[1], parts[3], parts[2], parts[4], parts[5]]);
    sendMessage(chatId, "✅ ممتاز! الموقع الآن متاح على صفحتك.");
    sendMainKeyboard(chatId);
  }
}

// تشغيل تعديل الوصف
function processEditDesc(chatId, text) {
  var parts = text.split(" ");
  if (parts.length < 3) {
    sendMessage(chatId, "❌ خطأ! التنسيق الصحيح:\n/edit_desc ID الوصف_الجديد");
    return;
  }
  
  var id = parts[1];
  var newDesc = text.substring(text.indexOf(parts[2])); // أخذ باقي النص كوصف
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var found = false;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 3).setValue(newDesc); // الوصف في العمود الثالث (C)
      found = true;
      break;
    }
  }
  
  if (found) {
    sendMessage(chatId, "✅ تم تحديث الوصف بنجاح.");
    listProjectsForControl(chatId);
  } else {
    sendMessage(chatId, "❌ لم يتم العثور على هذا ID: " + id);
  }
}

// --- وظائف مساعدة لتليجرام ---

function sendKeyboard(chatId, text, keyboard) {
  var url = telegramUrl + "/sendMessage";
  var payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify(keyboard)
  };
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}

function sendMessage(chatId, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + chatId + "&text=" + encodeURIComponent(text);
  UrlFetchApp.fetch(url);
}

function answerCallbackQuery(callbackQueryId) {
  UrlFetchApp.fetch(telegramUrl + "/answerCallbackQuery?callback_query_id=" + callbackQueryId);
}

function setWebhook() {
  var webAppUrl = "رابط_الـ_Web_App_الخاص_بك_هنا";
  UrlFetchApp.fetch(telegramUrl + "/setWebhook?url=" + webAppUrl);
}
