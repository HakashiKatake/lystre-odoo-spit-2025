export async function triggerN8NWebhook(payload: { data: string }) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) return

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
    } catch (error) {
        console.error('N8N Webhook trigger failed:', error)
    }
}
