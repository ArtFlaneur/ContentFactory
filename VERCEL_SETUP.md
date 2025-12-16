# 🚀 Vercel Production Setup

## Проверка и исправление ошибки "Missing API Key"

### 1️⃣ Проверьте переменные окружения на Vercel

Перейдите: **https://vercel.com/artflaneur/contentfactory/settings/environment-variables**

### 2️⃣ Убедитесь, что есть эти переменные:

**ОБЯЗАТЕЛЬНО для работы приложения:**

Скопируйте значения из вашего `.env.local` файла:

```bash
ANTHROPIC_API_KEY
```
Значение: (из .env.local)
Environment: ✅ Production, ✅ Preview, ✅ Development

```bash
VITE_ANTHROPIC_API_KEY
```
Значение: (такое же как ANTHROPIC_API_KEY)
Environment: ✅ Production, ✅ Preview, ✅ Development

```bash
VITE_SUPABASE_URL
```
Значение: (из .env.local)
Environment: ✅ Production, ✅ Preview, ✅ Development

```bash
VITE_SUPABASE_ANON_KEY
```
Значение: (из .env.local)
Environment: ✅ Production, ✅ Preview, ✅ Development

```bash
SUPABASE_SERVICE_ROLE_KEY
```
Значение: (из .env.local)
Environment: ✅ Production only

```bash
STRIPE_SECRET_KEY
```
Значение: (из .env.local)
Environment: ✅ Production only

```bash
VITE_SITE_URL
```
Значение: `https://content-factory-kohl.vercel.app`
Environment: ✅ Production, ✅ Preview, ✅ Development

---

### 3️⃣ Важно: Удалите старую переменную

Если есть переменная `DEEPSEEK_API_KEY` - удалите её, она больше не нужна.

---

### 4️⃣ После добавления переменных

1. Нажмите **Save** на каждой переменной
2. Перейдите в **Deployments**
3. Найдите последний production deployment
4. Нажмите **⋯** (три точки) → **Redeploy**
5. Выберите **Use existing Build Cache** - НЕТ (чтобы rebuild с новыми переменными)
6. Нажмите **Redeploy**

---

### 5️⃣ Проверка после деплоя

Откройте: https://content-factory-kohl.vercel.app

❌ **Если видите предупреждение:**
```
Missing API Key: Configure ANTHROPIC_API_KEY...
```

✅ **Проверьте:**
1. Переменная `ANTHROPIC_API_KEY` или `VITE_ANTHROPIC_API_KEY` установлена для Production
2. Был сделан **Redeploy** после добавления переменных
3. В логах деплоя нет ошибок (Deployments → View Function Logs)

---

### 🔍 Диагностика проблемы

**Если проблема сохраняется**, проверьте логи:

1. Перейдите: **Deployments → [Latest] → View Function Logs**
2. Откройте приложение и попробуйте сгенерировать пост
3. Посмотрите ошибки в логах

**Типичные ошибки:**
- `Anthropic API key is not configured` → переменная не установлена
- `401 Unauthorized` → неправильный API ключ
- `404 Not Found` → неправильный endpoint

---

## ⚡ Быстрая команда для коммита

После локальных изменений (если были):
```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push origin main
```

Vercel автоматически задеплоит изменения.
