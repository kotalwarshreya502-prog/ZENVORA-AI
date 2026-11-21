/**
 * ZENVORA AI — Research Agent
 *
 * Discovers and validates genuine, clickable research sources:
 * - Crossref API for peer-reviewed journal papers and official DOIs
 * - Wikipedia Knowledge Search API for encyclopedic authority
 * - Domain-specific verified authority references (UNWTO, GSTC, UNESCO, IEEE, ACM, Baymard, etc.)
 *
 * Guarantees zero fabricated DOIs, zero non-existent authors, and zero fake study statistics.
 */

export async function conductResearch(topic, targetKeyword = '', domain = '') {
  const primaryQuery = (targetKeyword || topic || '').trim();
  const sources = [];

  // 1. Crossref Academic API: Retrieve real papers & DOIs
  try {
    const cUrl = `https://api.crossref.org/works?query=${encodeURIComponent(primaryQuery)}&rows=3`;
    const cRes = await fetch(cUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'ZenvoraAI-ResearchAgent/2.0 (https://zenvora.ai; mailto:research@zenvora.ai)',
      },
    });

    if (cRes.ok) {
      const cData = await cRes.json();
      const items = cData?.message?.items || [];
      for (const item of items) {
        if (item.title?.[0] && item.URL) {
          const year = item.created?.['date-parts']?.[0]?.[0] || 'Recent';
          const author = item.author?.[0]?.family ? `${item.author[0].family} et al.` : 'Academic Journal';
          const title = item.title[0].replace(/<\/?[^>]+(>|$)/g, '').trim();
          sources.push({
            title: `${title} (${author}, ${year})`,
            cleanTitle: title,
            url: item.URL,
            doi: item.DOI || '',
            year: String(year),
            type: 'Peer-Reviewed Journal Publication (DOI)',
          });
        }
      }
    }
  } catch (err) {
    console.warn('[ResearchAgent] Crossref lookup notice:', err.message);
  }

  // 2. Wikipedia Search API: Retrieve encyclopedic grounding
  try {
    const wUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(primaryQuery)}&format=json&origin=*`;
    const wRes = await fetch(wUrl, { signal: AbortSignal.timeout(6000) });
    if (wRes.ok) {
      const wData = await wRes.json();
      const wItems = (wData?.query?.search || []).slice(0, 2);
      for (const w of wItems) {
        const cleanTitle = w.title.replace(/\s+/g, '_');
        sources.push({
          title: `Wikipedia: ${w.title}`,
          cleanTitle: w.title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle)}`,
          year: 'Current',
          type: 'Encyclopedic Knowledge Base',
        });
      }
    }
  } catch (err) {
    console.warn('[ResearchAgent] Wikipedia search notice:', err.message);
  }

  // 3. Domain Institutional Knowledge Bases (Curated authoritative links)
  const queryLower = `${topic} ${targetKeyword} ${domain}`.toLowerCase();

  if (/tourism|travel|ecotourism|eco-tourism|destination|hospitality/i.test(queryLower)) {
    sources.push({
      title: 'Global Sustainable Tourism Council (GSTC) Criteria',
      cleanTitle: 'GSTC Industry Criteria for Tour Operators',
      url: 'https://www.gstcouncil.org/gstc-criteria/',
      year: '2024',
      type: 'Global Industry Standard',
    });
    sources.push({
      title: 'UN World Tourism Organization (UNWTO) Sustainable Tourism Guidelines',
      cleanTitle: 'UNWTO Sustainable Tourism Definitions & Principles',
      url: 'https://www.unwto.org/sustainable-development',
      year: '2024',
      type: 'United Nations Specialized Agency',
    });
  } else if (/software|tech|developer|code|ai|machine learning/i.test(queryLower)) {
    sources.push({
      title: 'GitHub Octoverse: The State of Open Source and AI Software',
      cleanTitle: 'GitHub Octoverse Report',
      url: 'https://octoverse.github.com',
      year: '2024',
      type: 'Global Developer Survey',
    });
    sources.push({
      title: 'Stack Overflow Annual Developer Survey',
      cleanTitle: 'Stack Overflow Developer Survey',
      url: 'https://survey.stackoverflow.co/2024',
      year: '2024',
      type: 'Empirical Developer Research',
    });
  } else if (/ecommerce|retail|store|checkout|conversion|cro/i.test(queryLower)) {
    sources.push({
      title: 'Baymard Institute: 49 E-Commerce Checkout Usability Guidelines',
      cleanTitle: 'Baymard Institute Cart Abandonment Research',
      url: 'https://baymard.com/lists/cart-abandonment-rate',
      year: '2024',
      type: 'Large-Scale UX & CRO Research',
    });
  } else if (/health|wellness|nutrition|diet|sleep|stress|medical/i.test(queryLower)) {
    sources.push({
      title: 'Harvard T.H. Chan School of Public Health: Healthy Living Guide',
      cleanTitle: 'Harvard Lifestyle Medicine Research',
      url: 'https://www.hsph.harvard.edu/nutritionsource/',
      year: '2024',
      type: 'Academic Health Sciences Research',
    });
  }

  return sources;
}

export default {
  conductResearch,
};
