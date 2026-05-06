# AI Setup: Configuring the Nova Assistant

Novellum's AI writing assistant — **Nova** — is powered by [OpenRouter](https://openrouter.ai), a service that gives you access to dozens of AI models through a single API. Nova is entirely optional. Novellum works fully without it.

Because you bring your own API key, you are in full control of which model you use, how much you spend, and what data leaves your device. Novellum has no AI subscription and never charges you for AI usage.

---

## What Is OpenRouter?

OpenRouter is a third-party AI routing service that provides a single API endpoint for accessing models from providers like Anthropic (Claude), OpenAI (GPT-4), Google (Gemini), and many open-source alternatives. Instead of signing up separately for each AI provider, you create one OpenRouter account and access all their models in one place.

When Nova sends a request, it goes directly from your computer to OpenRouter's servers. It does not pass through any Novellum servers.

---

## Step 1: Create an OpenRouter Account

1. Open your browser and go to [openrouter.ai](https://openrouter.ai).
2. Click **Sign Up** in the top-right corner.
3. Create an account with your email address, or sign in with GitHub or Google.
4. Verify your email if prompted.

OpenRouter offers a small amount of free credits when you sign up. For ongoing use, you can add a payment method and purchase credits.

---

## Step 2: Generate an API Key

1. Once logged in, click your profile icon in the top-right corner and select **API Keys** (or navigate to **openrouter.ai/keys**).
2. Click **Create Key**.
3. Give your key a name — for example, **Novellum** — so you can identify it later.
4. Click **Create** and then immediately **copy the key**. It will only be shown once.

Your API key looks something like: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Store it somewhere safe (such as a password manager) in case you need it again.

---

## Step 3: Add Your Key in Novellum

1. Open Novellum.
2. Click the **Settings** icon in the sidebar (gear icon), or press **Cmd+,** (macOS) / **Ctrl+,** (Windows).
3. Navigate to the **AI** section.
4. Paste your OpenRouter API key into the **API Key** field.
5. Click **Save**.

Novellum will immediately verify the key by making a lightweight test request. If the key is valid, you will see a green confirmation indicator.

### How the Key Is Stored

Your API key is stored in your local OS configuration — on macOS in the system Keychain, on Windows in the Credential Manager. **It is never sent to Novellum's servers** because Novellum has no servers. Requests go directly from your computer to OpenRouter.

---

## Step 4: Select Your Preferred Model

After saving your key, a **Default Model** dropdown will appear in the AI settings. Choose the model you want Nova to use by default.

Some popular options:

| Model | Strengths | Cost level |
| :--- | :--- | :--- |
| Claude 3.5 Sonnet | Strong prose quality, long-context | Medium |
| GPT-4o | General purpose, fast | Medium |
| Gemini Flash | Very fast, cost-efficient | Low |
| Mistral Medium | Open-weight, privacy-focused | Low |

You can change the model at any time. Nova will use whatever model is set as the default when you open the sidebar.

---

## Understanding Costs

OpenRouter charges per token (roughly per word). Most Nova interactions — brainstorming, rewriting a scene, summarising — cost a fraction of a cent. A full evening of AI-assisted writing typically costs less than a dollar, depending on the model you choose.

You can set a monthly spending cap in your OpenRouter account settings. Novellum will never spend money on your behalf beyond what you configure in OpenRouter.

---

## What Data Is Sent to the AI?

Novellum's **Context Engine** determines exactly what data is included in each AI request. It never sends your entire manuscript. It builds a minimal, scoped context that includes only what the AI needs for the specific task you requested.

Before Nova sends a request, the **Nova sidebar** shows you a **Context disclosure** — a summary of exactly what data will be sent. You can review this before confirming.

Typical context might include:

- The current scene text
- The scene's title and position in the outline
- Active characters in the scene (names and short descriptions)
- Any specific text you have selected or highlighted

Your worldbuilding data, other chapters, and any information not relevant to the current task is **not** sent unless you explicitly include it.

---

## Testing That Nova Is Working

1. Open a project and navigate to the editor.
2. Click the **Nova** icon in the right sidebar (or press **Cmd+Shift+N** / **Ctrl+Shift+N**).
3. Type a prompt such as: *"What are some ways to increase tension in this scene?"*
4. Press **Enter** or click **Send**.

If Nova responds, your setup is complete.

---

## Removing or Rotating Your API Key

To remove or change your key:

1. Go to **Settings → AI**.
2. Clear the **API Key** field and click **Save**, or paste your new key and click **Save**.

If you believe your key has been compromised, revoke it immediately from the OpenRouter dashboard (**openrouter.ai/keys**) and generate a new one.
