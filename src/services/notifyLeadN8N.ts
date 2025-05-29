interface NotifyLeadParams {
    leadName: string
    leadPhone: string
    leadMessage: string
    companyZapNumber: string
    interest: string
    webhookUrl: string
}

export async function notifyLeadToN8N({
    leadName,
    leadPhone,
    leadMessage,
    companyZapNumber,
    interest,
    webhookUrl,
}: NotifyLeadParams): Promise<void> {
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leadName,
                leadPhone,
                leadMessage,
                companyZapNumber,
                interest,
            }),
        })
    } catch (error) {
        console.error('Erro ao notificar o N8N:', error)
    }
}
