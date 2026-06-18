import { getPrisma } from '@/lib/prisma'
import { error, appUrl } from '@/lib/http'
import { generateBrochure } from '@/lib/services/pdf'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(request, context) {
  const { id } = await context.params

  try {
    const lead = await getPrisma().lead.findUnique({
      where: { id },
      include: { raffleEntry: true },
    })

    if (!lead) return error('Lead not found', 404)

    const pdfBuffer = await generateBrochure(lead, appUrl(request))
    const filename = `ARD_Brochure_${lead.name.replace(/\s+/g, '_')}.pdf`

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    logger.error('PDF generation failed:', err)
    return error('PDF generation failed', 500)
  }
}
