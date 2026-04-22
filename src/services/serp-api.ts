import { env } from '@/config/validatedEnv'

export type SerpContact = {
  name: string
  phone: string
  website?: string
  address?: string
  category?: string
  rating?: number
}

type SerpLocalResult = {
  title?: string
  phone?: string
  website?: string
  address?: string
  type?: string
  rating?: number
}

const PAGE_SIZE = 20

export async function searchContactsViaSerpApi(
  query: string,
  location?: string,
  maxResults: number = 100,
  startFrom: number = 0,
): Promise<SerpContact[]> {
  if (!env.SERP_API_KEY) throw new Error('SERP_API_KEY não configurada')

  const contacts: SerpContact[] = []
  const pages = Math.ceil(maxResults / PAGE_SIZE)

  for (let page = 0; page < pages; page++) {
    const params = new URLSearchParams({
      engine: 'google_maps',
      q: location ? `${query} ${location}` : query,
      api_key: env.SERP_API_KEY,
      hl: 'pt',
      gl: 'br',
      type: 'search',
      start: String(startFrom + page * PAGE_SIZE),
    })

    const res = await fetch(`https://serpapi.com/search.json?${params}`)
    if (!res.ok) throw new Error(`SerpApi error: ${res.status}`)

    const data = await res.json()
    const results: SerpLocalResult[] = data.local_results ?? []

    for (const r of results) {
      if (r.phone) {
        contacts.push({
          name: r.title ?? '',
          phone: r.phone,
          website: r.website,
          address: r.address,
          category: r.type,
          rating: r.rating,
        })
      }
    }

    // fewer results than a full page = no more pages available
    if (results.length < PAGE_SIZE) break
  }

  return contacts
}
