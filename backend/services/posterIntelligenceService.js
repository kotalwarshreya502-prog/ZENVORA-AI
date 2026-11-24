/**
 * ZENVORA AI — Universal Poster Intelligence & Creative Design Engine
 * Powered by OpenAI GPT-4o and Anthropic Claude.
 *
 * Dynamically analyzes ANY campaign across ANY industry (Food, Fashion, Tech, Real Estate, etc.),
 * extracts the exact visual hero subject, enforces 100% strict offer accuracy,
 * synthesizes photorealistic commercial advertising prompts, and builds complete design specs.
 *
 * Zero Google Gemini dependencies. Zero fake mockups.
 */

import AIProviderService from './aiProviderService.js';
import { extractStrictOffer, buildStrictOfferRules, sanitizeGeneratedText } from '../utils/offerIntegrity.js';

// ── Category detection keywords (specific product keywords checked FIRST) ─────
export const CATEGORY_KEYWORDS = {
  books:        ['book', 'books', 'bookstore', 'novel', 'novels', 'reading', 'library', 'literature', 'author', 'fiction', 'textbook', 'hardcover', 'paperback', 'read', 'bookmark', 'publishing', 'storybooks', 'audiobooks'],
  jewellery:    ['jewellery', 'jewelry', 'diamond', 'gold', 'silver', 'necklace', 'ring', 'earrings', 'bracelet', 'gemstone', 'gemstones', 'luxury accessories', 'pendant', 'jewel', 'platinum'],
  watches:      ['watch', 'watches', 'wristwatch', 'timepiece', 'luxury watch', 'chronograph', 'rolex', 'omega', 'smartwatch', 'wrist watch'],
  furniture:    ['furniture', 'sofa', 'couch', 'dining table', 'chair', 'desk', 'bed', 'mattress', 'wardrobe', 'interior design', 'home decor', 'cabinet', 'bookshelf'],
  perfume:      ['perfume', 'fragrance', 'cologne', 'scent', 'eau de parfum', 'mist', 'deodorant', 'body spray'],
  fitness:      ['gym', 'fitness', 'workout', 'bodybuilding', 'crossfit', 'dumbbell', 'weights', 'yoga', 'protein', 'trainer', 'exercise', 'muscle', 'health club'],
  eyewear:      ['sunglasses', 'glasses', 'spectacles', 'eyewear', 'shades', 'optical', 'frames', 'lenses', 'rayban'],
  flowers:      ['flowers', 'florist', 'bouquet', 'roses', 'flower', 'floral', 'plants', 'gardening', 'nursery', 'tulips', 'orchids'],
  groceries:    ['grocery', 'groceries', 'supermarket', 'fruits', 'vegetables', 'organic food', 'mart', 'daily essentials', 'produce', 'vegetable', 'fruit'],
  gaming:       ['gaming', 'video games', 'gamer', 'playstation', 'xbox', 'nintendo', 'pc gaming', 'esports', 'console', 'controller', 'arcade'],
  music:        ['guitar', 'music', 'instruments', 'piano', 'drums', 'violin', 'audio', 'singer', 'band', 'studio', 'sound', 'musical'],
  pets:         ['pet', 'pets', 'dog', 'cat', 'puppy', 'kitten', 'veterinary', 'pet food', 'dog food', 'pet care', 'vet clinic', 'canine', 'feline'],
  dentistry:    ['dentist', 'dental', 'teeth', 'teeth whitening', 'braces', 'orthodontics', 'oral care', 'smile', 'dental clinic'],
  toys:         ['toys', 'toy', 'games', 'kids toys', 'lego', 'dolls', 'board game', 'baby toys', 'plush', 'action figures'],
  headphones:   ['headphones', 'earbuds', 'airpods', 'wireless earphones', 'headset', 'audio speaker', 'soundbar', 'bluetooth earphone'],
  solar:        ['solar', 'solar panel', 'clean energy', 'renewable energy', 'rooftop solar', 'green energy', 'photovoltaic'],
  samosa:       ['samosa', 'samosas', 'sambusa', 'singhara', 'aloo samosa', 'samosa chaat'],
  pizza:        ['pizza', 'pizzeria', 'wood fired pizza', 'slice', 'margherita', 'pepperoni'],
  burger:       ['burger', 'cheeseburger', 'hamburger', 'fast food', 'patty', 'bacon burger'],
  coffee:       ['coffee', 'espresso', 'cappuccino', 'latte', 'cafe', 'roast', 'barista', 'cold brew'],
  cake:         ['cake', 'chocolate cake', 'pastry', 'dessert', 'sweet delight', 'bakery', 'truffle cake', 'cupcake', 'brownie'],
  indiansweets: ['gulabjamun', 'gulab jamun', 'jalebi', 'ladoo', 'laddu', 'barfi', 'barfee', 'rasgulla', 'rasmalai', 'halwa', 'kheer', 'peda', 'modak', 'kaju katli', 'mithai', 'indian sweets', 'sweet shop', 'mishri', 'kalakand', 'motichoor', 'rabri', 'gajar ka halwa', 'moong dal halwa', 'khoya'],
  indianfood:   ['biryani', 'curry', 'dal', 'roti', 'naan', 'chaat', 'tikka', 'masala', 'paneer', 'dosa', 'idli', 'vada', 'paratha', 'thali', 'rajma', 'chole', 'sabzi', 'butter chicken', 'tandoori', 'korma', 'pulao', 'khichdi', 'pav bhaji', 'bhel', 'dhokla', 'uttapam', 'appam', 'puttu', 'poha', 'upma', 'aloo', 'matar', 'gosht', 'kebab'],
  food:         ['restaurant', 'food', 'cuisine', 'recipe', 'menu', 'chef', 'eat', 'dining', 'bistro', 'gourmet', 'culinary', 'tacos', 'pasta', 'sushi', 'noodles', 'snack', 'ice cream', 'bbq', 'barbecue'],
  footwear:     ['sneakers', 'shoes', 'running shoes', 'boots', 'footwear', 'loafers', 'kicks', 'athletic shoes', 'trainers', 'heels', 'sandals'],
  smartphone:   ['smartphone', 'phone', 'mobile', 'android', 'iphone', 'flagship phone', '5g phone', 'galaxy s25', 'oled display'],
  tech:         ['technology', 'tech', 'software', 'app', 'saas', 'startup', 'ai', 'digital', 'gadget', 'device', 'smart device', 'hardware', 'cloud', 'cyber', 'platform', 'automation', 'laptop'],
  beauty:       ['skincare', 'cosmetics', 'makeup', 'serum', 'lotion', 'facial', 'beauty', 'salon', 'hair', 'grooming', 'organic skincare', 'spa', 'dermatology'],
  fashion:      ['fashion', 'clothing', 'apparel', 'outfit', 'wear', 'couture', 'garment', 'collection', 'summer collection', 'dress', 'linen', 'jacket', 'hoodie', 't-shirt'],
  realestate:   ['real estate', 'property', 'apartment', 'villa', 'flat', 'housing', 'builder', 'plot', 'residence', 'realtor', 'architecture', 'penthouse', 'homes'],
  travel:       ['travel', 'tourism', 'hotel', 'resort', 'holiday', 'vacation', 'tour', 'destination', 'flight', 'adventure', 'cruise', 'getaway', 'package'],
  automotive:   ['car', 'vehicle', 'automobile', 'motorcycle', 'electric vehicle', 'suv', 'test drive', 'dealership', 'sedan'],
  education:    ['education', 'coaching', 'classes', 'institute', 'school', 'college', 'university', 'admission', 'course', 'training', 'learn', 'academy', 'student', 'batches', 'campus', 'degree', 'study', 'admissions open'],
  healthcare:   ['health', 'medical', 'hospital', 'wellness', 'clinic', 'doctor', 'pharmacy', 'fitness', 'gym', 'yoga', 'dental', 'care', 'therapy', 'checkup', 'preventive'],
  festive:      ['diwali', 'festival', 'celebration', 'christmas', 'new year', 'eid', 'holiday', 'thanksgiving', 'dhanteras', 'festive', 'carnival', 'dhamaka', 'holi'],
  ecommerce:    ['shopping', 'buy', 'shop', 'store', 'cart', 'retail', 'outlet', 'mega sale', 'flash sale', 'amazon', 'flipkart', 'walmart'],
};

// ── Hero subject & atmosphere definitions by category ─────────────────────────
export const CATEGORY_SUBJECT_PROFILES = {
  books: {
    heroSubject: 'aesthetic arrangement of open and stacked hardcover and paperback books with rich embossed titles, textured paper edges, elegant bookmark ribbons, and warm reading ambiance',
    setting: 'rustic polished oak library table or cozy independent bookstore nook with warm atmospheric lamp glow, vintage reading glasses, and rows of mahogany bookshelves softly blurred in background',
    colors: 'warm parchment amber, rich leather burgundy, deep oak brown, forest green, warm gold',
    mood: 'intellectual inspiring literary cozy bookstore atmosphere',
    allowPeople: false,
    layout: 'editorial',
  },
  jewellery: {
    heroSubject: 'exquisite luxury diamond and gold jewelry necklace with sparkling faceted gemstones, pristine brilliance, and macro reflections',
    setting: 'resting on an ultra-smooth dark velvet or reflective black onyx pedestal with directional jewelry spotlighting and pristine crystal reflections',
    colors: 'radiant 24k gold, brilliant diamond white, deep obsidian black, champagne',
    mood: 'ultra-prestigious high-luxury haute joaillerie',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  watches: {
    heroSubject: 'luxury Swiss mechanical wristwatch showcasing intricate skeleton dial, polished sapphire crystal, and brushed stainless steel chronometer finish',
    setting: 'resting on a dark carbon fiber or slate platform with dramatic precision studio rim lighting and crisp metallic reflections',
    colors: 'precision silver, midnight blue, rose gold, slate black',
    mood: 'prestigious precision luxury horology craftsmanship',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  furniture: {
    heroSubject: 'stunning designer Scandinavian modern living room furniture ensemble featuring premium tailored sofa, minimalist solid oak coffee table, and designer floor lamp',
    setting: 'sunlit architectural living room with floor-to-ceiling glass windows, warm hardwood floors, and serene minimalist interior design',
    colors: 'warm oat beige, natural oak, muted sage, soft charcoal',
    mood: 'serene sophisticated contemporary interior lifestyle',
    allowPeople: false,
    layout: 'full-bleed',
  },
  perfume: {
    heroSubject: 'luxurious bespoke crystal fragrance perfume bottle with radiant mist spray, golden cap, and crystal-clear reflective glass curves',
    setting: 'perched on a wet polished marble slab surrounded by delicate flower petals, water ripples, and soft diffused morning light',
    colors: 'rose champagne, crystalline amber, gold, pure marble white',
    mood: 'sensory alluring high-end luxury fragrance advertising',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  fitness: {
    heroSubject: 'pair of heavy cast-iron matte black dumbbells and resistance training equipment arranged dynamically',
    setting: 'modern industrial boutique fitness gym with dark concrete walls, dramatic overhead neon cross-lighting, and motivating athletic vibe',
    colors: 'matte black, athletic neon volt, steel chrome, charcoal',
    mood: 'powerful high-energy athletic fitness performance',
    allowPeople: false,
    layout: 'bold-promotional',
  },
  eyewear: {
    heroSubject: 'designer polarized sunglasses with premium tortoise shell acetate frame and gradient anti-reflective tinted lenses',
    setting: 'resting on sun-bleached driftwood or polished stone with warm golden Mediterranean summer sunlight reflections',
    colors: 'warm amber tortoise, golden ray, deep bronze, seafoam',
    mood: 'stylish effortless summer lifestyle luxury',
    allowPeople: false,
    layout: 'product-focused',
  },
  flowers: {
    heroSubject: 'breathtaking handcrafted floral bouquet with fresh blooming pastel roses, peonies, eucalyptus leaves, and baby breath',
    setting: 'wrapped in natural artisanal craft paper and silk ribbon resting on a rustic wooden flower shop counter with morning dew drops',
    colors: 'blush pink, soft cream, sage green, petal peach, lavender',
    mood: 'fresh romantic uplifting artisanal florist beauty',
    allowPeople: false,
    layout: 'editorial',
  },
  groceries: {
    heroSubject: 'vibrant rustic wooden crate overflowing with farm-fresh organic crisp vegetables, ripe heritage tomatoes, and vibrant fruits',
    setting: 'rustic farmers market stall with crisp morning natural sunlight and dew drops glistening on fresh produce',
    colors: 'vibrant leaf green, ripe tomato red, sunlit carrot orange, earthy wood',
    mood: '100% wholesome organic farm-to-table fresh goodness',
    allowPeople: false,
    layout: 'product-focused',
  },
  gaming: {
    heroSubject: 'next-gen gaming console controller and backlit mechanical gaming keyboard with vibrant programmable RGB lighting',
    setting: 'futuristic dark esports gaming setup with holographic purple and cyan accent neon tubes and sleek carbon desk mat',
    colors: 'cyberpunk purple, neon electric cyan, matte stealth black',
    mood: 'immersive adrenaline-fueled competitive gaming experience',
    allowPeople: false,
    layout: 'bold-promotional',
  },
  music: {
    heroSubject: 'magnificent acoustic handcrafted guitar with polished rosewood grain and golden brass tuning pegs',
    setting: 'warm atmospheric recording studio with acoustic wood diffuser walls and warm vintage incandescent filament bulb glow',
    colors: 'rich rosewood, honey sunburst, brass gold, warm amber',
    mood: 'soulful authentic artisanal musical passion',
    allowPeople: false,
    layout: 'editorial',
  },
  pets: {
    heroSubject: 'healthy cheerful golden retriever dog with shiny coat and happy expression beside premium organic pet food bowl',
    setting: 'bright clean sunlit modern home living room with soft natural daylight and joyful pet care atmosphere',
    colors: 'warm golden honey, natural cream, grass green, sky blue',
    mood: 'heartwarming joyful loving premium pet care and wellness',
    allowPeople: false,
    layout: 'product-focused',
  },
  dentistry: {
    heroSubject: 'pristine modern dental care aesthetic with mirror and precision instruments showcasing radiant healthy smile care',
    setting: 'state-of-the-art dental wellness clinic with soft diffused natural daylight, pristine hygiene, and compassionate health ambiance',
    colors: 'clinical cyan, pearlescent white, trust navy, soft mint',
    mood: 'confident radiant healthy bright smile transformation',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  toys: {
    heroSubject: 'colorful creative wooden building blocks and imaginative toy set arranged playfully',
    setting: 'bright cheerful sun-filled modern nursery with soft pastel educational playroom backdrop',
    colors: 'cheerful sunshine yellow, sky blue, playful red, mint green',
    mood: 'joyful creative imaginative childhood learning and fun',
    allowPeople: false,
    layout: 'product-focused',
  },
  headphones: {
    heroSubject: 'ultra-premium matte wireless noise-cancelling over-ear headphones with memory foam ear cushions and brushed aluminum accents',
    setting: 'floating dynamically against a dark minimalist acoustic foam studio backdrop with clean edge rim lighting',
    colors: 'matte slate black, champagne silver, dark graphite',
    mood: 'pure audiophile studio acoustic perfection and comfort',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  solar: {
    heroSubject: 'sleek high-efficiency crystalline rooftop solar panels with blue-black photovoltaic cell patterns reflecting clear open sky',
    setting: 'modern sustainable eco-home roof under bright brilliant blue sky and radiant golden sun rays',
    colors: 'deep solar blue, clean silver, bright sunlit cyan, emerald green',
    mood: 'empowering clean sustainable renewable energy independence',
    allowPeople: false,
    layout: 'full-bleed',
  },
  samosa: {
    heroSubject: 'plate of freshly fried, golden-brown crispy Indian samosas with flaky triangular pastry crust, filled with savory spiced potatoes and green peas, served with small bowls of fresh green mint chutney and sweet red tamarind chutney, garnished with fresh coriander leaves, mouthwatering food photography filling 85% of frame',
    setting: 'rustic dark slate platter and small brass dipping bowls with warm restaurant ambient lighting, delicate steam gently rising from the hot samosas, strictly food macro shot',
    colors: 'golden amber, crispy crust brown, vibrant mint green, deep tamarind red',
    mood: 'mouthwatering appetizing crispy hot Indian street food delicacy',
    allowPeople: false,
    layout: 'product-focused',
  },
  pizza: {
    heroSubject: 'macro extreme close-up of a steaming hot artisanal wood-fired pizza with bubbling melted mozzarella cheese pull, rich tomato sauce, savory toppings, and fresh gourmet culinary herbs, centered product filling 85% of frame',
    setting: 'rustic dark wood pizza peel and slate board with light dusting of flour and warm Italian stone oven ambient background glow, strictly food macro shot',
    colors: 'rustic terracotta, rich tomato red, melted mozzarella gold, basil green',
    mood: 'mouthwatering appetizing artisanal gourmet pizza dining',
    allowPeople: false,
    layout: 'editorial',
  },
  burger: {
    heroSubject: 'gourmet juicy grilled burger with melted cheddar cheese, crisp lettuce, ripe tomato slice, and toasted sesame brioche bun',
    setting: 'presented on a dark slate board with golden crispy fries and warm gastro-pub soft bokeh lighting',
    colors: 'golden amber, rich grilled mahogany, cheddar yellow, fresh leaf green',
    mood: 'mouthwatering appetizing gourmet burger dining',
    allowPeople: false,
    layout: 'product-focused',
  },
  coffee: {
    heroSubject: 'rich steaming artisanal espresso cappuccino in ceramic cup with intricate latte art and scattered roasted coffee beans',
    setting: 'warm rustic wooden cafe table with morning sunlight streaming through cafe window and soft steam rising',
    colors: 'roasted coffee brown, creamy ivory, warm morning gold',
    mood: 'cozy premium cafe barista dining',
    allowPeople: false,
    layout: 'editorial',
  },
  cake: {
    heroSubject: 'decadent artisanal dark chocolate ganache cake garnished with fresh wild berries and edible gold leaf',
    setting: 'presented on an elegant dark rustic slate stand in an upscale pastry bistro with soft warm golden bokeh lighting',
    colors: 'dark cocoa, warm amber, berry crimson, gold',
    mood: 'luxurious indulgent dessert pastry',
    allowPeople: false,
    layout: 'editorial',
  },
  indiansweets: {
    heroSubject: 'authentic traditional Indian mithai sweet — perfectly round golden-brown gulab jamun dumplings glistening with rose-scented sugar syrup, garnished with crushed pistachios and saffron strands, macro close-up filling 85% of frame',
    setting: 'arranged on an ornate brass thali with rose petals and crushed pistachio garnish, warm diya candle bokeh glow in background, traditional Indian festival ambiance, strictly food macro shot',
    colors: 'warm golden amber, rose saffron, pistachio green, deep crimson',
    mood: 'authentic traditional festive Indian sweets celebration',
    allowPeople: false,
    layout: 'editorial',
  },
  indianfood: {
    heroSubject: 'authentic vibrant traditional Indian cuisine dish with aromatic spices, rich gravy, freshly garnished with coriander and cream, macro close-up centered product shot filling 85% of frame',
    setting: 'served in a copper or ceramic bowl on a dark rustic stone surface with scattered whole spices, fresh herbs, and warm Indian kitchen ambient lighting, strictly food macro shot',
    colors: 'rich saffron, deep turmeric gold, earthy terracotta, fresh herb green',
    mood: 'authentic aromatic traditional Indian culinary dining',
    allowPeople: false,
    layout: 'editorial',
  },
  food: {
    heroSubject: 'gourmet chef-prepared culinary specialty dish with fresh ingredients and vibrant artisanal garnishes, extreme close-up product shot filling 85% of frame',
    setting: 'styled on a high-end restaurant ceramic plate with warm atmospheric dining ambient lighting, strictly food macro shot',
    colors: 'warm appetizing amber, herb green, rich glaze, warm golden glow',
    mood: 'exquisite fine dining culinary excellence',
    allowPeople: false,
    layout: 'product-focused',
  },
  footwear: {
    heroSubject: 'pair of ultra-premium athletic sneakers with intricate performance textures and aerodynamic soles',
    setting: 'resting dynamically on a polished reflective black acrylic studio pedestal with subtle smoke haze and dramatic dual softbox studio lighting',
    colors: 'matte black, electric neon, clean studio white',
    mood: 'energetic cutting-edge commercial footwear advertising',
    allowPeople: false,
    layout: 'product-focused',
  },
  smartphone: {
    heroSubject: 'flagship sleek modern smartphone with curved bezel-less OLED display showcasing rich vivid reflections',
    setting: 'resting on an ultra-smooth dark reflective glass surface with dual-tone neon cyan and electric violet volumetric studio rim lighting',
    colors: 'electric cyan, deep indigo, carbon black',
    mood: 'innovative cutting-edge premium technology launch',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  tech: {
    heroSubject: 'sleek minimalist technology product on a dark carbon stone pedestal',
    setting: 'subtle dual-tone cyan and deep violet volumetric studio rim lighting with clean glass reflections',
    colors: 'electric cyan, deep indigo, carbon black',
    mood: 'innovative cutting-edge premium technology',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  beauty: {
    heroSubject: 'luxurious amber glass cosmetic skincare serum bottle with gold dropper surrounded by clean water ripples, fresh botanical aloe leaves, and pure natural droplets',
    setting: 'resting on a smooth natural travertine stone pedestal with soft diffused morning sunlight and clean organic luxury spa aesthetic',
    colors: 'soft botanical green, radiant champagne gold, pure water crystal, ivory',
    mood: 'pure radiant clean clinical skincare luxury',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  fashion: {
    heroSubject: 'luxurious high-fashion editorial apparel styling featuring natural linen and tailored fabrics with elegant draped silhouettes',
    setting: 'sun-drenched architectural cyclorama studio with soft natural light shadows and clean Mediterranean minimalist aesthetic',
    colors: 'warm sand, natural linen, terracotta, soft ivory',
    mood: 'effortless sophisticated high-fashion editorial',
    allowPeople: false,
    layout: 'editorial',
  },
  realestate: {
    heroSubject: 'stunning luxury architectural residential high-rise building exterior at golden hour dusk with illuminated glass balconies',
    setting: 'overlooking an expansive horizon with landscaped infinity pool terrace in foreground and warm twilight sky',
    colors: 'warm twilight amber, platinum grey, champagne gold, deep sapphire',
    mood: 'prestigious luxury breathtaking architectural presentation',
    allowPeople: false,
    layout: 'full-bleed',
  },
  travel: {
    heroSubject: 'breathtaking tropical infinity pool terrace overlooking turquoise ocean waves and swaying palm silhouettes at luxury beachfront resort',
    setting: 'luxury island beachfront resort at warm sun-drenched golden hour with crystalline waters and five-star cabana loungers',
    colors: 'turquoise blue, warm sand gold, tropical emerald, coral',
    mood: 'luxurious serene tropical vacation getaway',
    allowPeople: false,
    layout: 'full-bleed',
  },
  automotive: {
    heroSubject: 'stunning luxury performance vehicle showcasing aerodynamic contours and glistening metallic finish',
    setting: 'modern architectural showroom pavilion with dynamic floor reflections and sleek ambient linear lighting',
    colors: 'metallic graphite, silver platinum, deep obsidian, electric blue',
    mood: 'prestigious dynamic automotive excellence',
    allowPeople: false,
    layout: 'full-bleed',
  },
  education: {
    heroSubject: 'inspiring stack of modern textbooks and graduation scroll resting on a polished oak library desk with open laptop',
    setting: 'prestigious university architectural atrium with expansive glass windows, polished oak study tables, and uplifting natural daylight',
    colors: 'warm oak, university navy, sunlit ivory, campus gold',
    mood: 'inspiring empowering academic admission announcement',
    allowPeople: false,
    layout: 'bold-promotional',
  },
  healthcare: {
    heroSubject: 'clean modern medical stethoscope and wellness symbol resting on an immaculate clinical white surface with fresh green leaf',
    setting: 'bright modern hospital wellness environment with soft diffused daylight and clean compassionate healthcare aesthetic',
    colors: 'clinical cyan, healing teal, crisp white, deep trust navy',
    mood: 'reassuring compassionate world-class medical excellence',
    allowPeople: false,
    layout: 'minimal-luxury',
  },
  festive: {
    heroSubject: 'luxurious celebratory gift hampers, golden sweets boxes, and festive decorative accents',
    setting: 'authentic traditional glowing clay diyas, warm golden bokeh fairy lights, and rich festive backdrop with marigold flower petals',
    colors: 'warm gold, royal festive indigo, deep saffron, amber',
    mood: 'joyful celebratory premium festive shopping',
    allowPeople: false,
    layout: 'bold-promotional',
  },
  ecommerce: {
    heroSubject: 'premium commercial product display showcase with celebratory gift ribbons',
    setting: 'glossy reflective podium with directional commercial studio softbox lighting and soft reflections',
    colors: 'crimson red, warm gold, champagne, clean white',
    mood: 'exciting energetic high-value commercial retail',
    allowPeople: false,
    layout: 'product-focused',
  },
  default: {
    heroSubject: 'commercial advertising product presentation tailored to the campaign',
    setting: 'modern commercial advertising studio set, clean podium with soft studio rim lighting',
    colors: 'dynamic brand palette, crisp white, deep accent',
    mood: 'engaging professional memorable commercial advertising',
    allowPeople: false,
    layout: 'product-focused',
  },
};

// ── Dynamic brand logo fetcher ────────────────────────────────────────────────
export async function fetchBrandLogo(brandName, officialWebsite = '') {
  if (!brandName) return null;

  let domain = '';
  if (officialWebsite) {
    try {
      const url = new URL(officialWebsite.startsWith('http') ? officialWebsite : `https://${officialWebsite}`);
      domain = url.hostname.replace(/^www\./, '');
    } catch {}
  }

  const cleanName = brandName.toLowerCase().trim();
  const knownBrandDomains = {
    'flipkart': 'flipkart.com',
    'nike': 'nike.com',
    'samsung': 'samsung.com',
    'apple': 'apple.com',
    'adidas': 'adidas.com',
    'zara': 'zara.com',
    'amazon': 'amazon.com',
    'starbucks': 'starbucks.com',
    'dominos': 'dominos.com',
    'mcdonalds': 'mcdonalds.com',
  };

  if (!domain && knownBrandDomains[cleanName]) {
    domain = knownBrandDomains[cleanName];
  }

  if (!domain) {
    const slug = cleanName.replace(/[^a-z0-9]/g, '');
    domain = `${slug}.com`;
  }

  const logoUrl = `https://api.companyenrich.com/logo/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

  return {
    logoUrl,
    fallbackUrl,
    domain,
    brandName,
    source: 'verified-brand-asset',
  };
}

// ── Priority-Ordered Universal Category Detector ─────────────────────────────
// Specific products ALWAYS take precedence over generic "sale" or "discount" words!
function matchKeywords(text, keywords = []) {
  return keywords.some(kw => {
    if (kw.length <= 4) {
      return new RegExp(`\\b${kw}\\b`, 'i').test(text);
    }
    return text.includes(kw);
  });
}

export function detectCategory(description = '', explicitIndustry = '') {
  const lower = `${explicitIndustry} ${description}`.toLowerCase();

  // 1. Food verticals (checked FIRST so "50% off samosa" matches samosa, NOT generic ecommerce)
  if (matchKeywords(lower, CATEGORY_KEYWORDS.samosa)) return 'samosa';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.pizza)) return 'pizza';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.burger)) return 'burger';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.coffee)) return 'coffee';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.cake)) return 'cake';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.indiansweets)) return 'indiansweets';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.indianfood)) return 'indianfood';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.food) || /\b(restaurant|dining|food|snack|dish|eat|curry)\b/i.test(lower)) return 'food';

  // 2. Retail Product & Specific Consumer Goods Verticals
  if (matchKeywords(lower, CATEGORY_KEYWORDS.books)) return 'books';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.jewellery)) return 'jewellery';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.watches)) return 'watches';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.furniture)) return 'furniture';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.perfume)) return 'perfume';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.fitness)) return 'fitness';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.eyewear)) return 'eyewear';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.flowers)) return 'flowers';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.groceries)) return 'groceries';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.gaming)) return 'gaming';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.music)) return 'music';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.dentistry)) return 'dentistry';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.toys)) return 'toys';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.headphones)) return 'headphones';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.solar)) return 'solar';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.footwear)) return 'footwear';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.smartphone)) return 'smartphone';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.beauty)) return 'beauty';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.fashion)) return 'fashion';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.tech)) return 'tech';

  // 3. Service & Real-World Verticals (Education, Real estate, Travel, Auto, Healthcare)
  if (matchKeywords(lower, CATEGORY_KEYWORDS.education)) return 'education';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.realestate)) return 'realestate';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.travel)) return 'travel';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.automotive)) return 'automotive';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.healthcare)) return 'healthcare';
  if (matchKeywords(lower, CATEGORY_KEYWORDS.pets)) return 'pets';

  // 4. Festive
  if (matchKeywords(lower, CATEGORY_KEYWORDS.festive)) return 'festive';

  // 5. Generic E-commerce (last resort when no specific product is identified)
  if (matchKeywords(lower, CATEGORY_KEYWORDS.ecommerce) || /\b(sale|offer|discount|deal|shop)\b/i.test(lower)) {
    return 'ecommerce';
  }

  return 'default';
}

// ── Dynamic Input Analysis via OpenAI / Claude / Deterministic Heuristics ──────
export async function analyzeInput(description, customApiKey = '', explicitOffer = '', explicitIndustry = '') {
  const category = detectCategory(description, explicitIndustry);
  const profile = CATEGORY_SUBJECT_PROFILES[category] || CATEGORY_SUBJECT_PROFILES.default;

  // Extract strict ground-truth offer from user input
  const strictOffer = extractStrictOffer(description, explicitOffer);
  const strictRules = buildStrictOfferRules(strictOffer, `User Campaign: "${description}"`);

  // Try real LLM (Claude or OpenAI)
  const prompt = `You are a World-Class Commercial Advertising Creative Director.
Analyze this marketing campaign request: "${description}"

${strictRules}

CRITICAL RULES:
1. The visualSubject MUST describe the EXACT hero product, dish, or item requested in "${description}".
   - If the request is about samosa, describe delicious, golden-brown, crispy Indian samosas with chutney. NEVER describe electronics, computers, or empty rooms.
   - If the request is about shoes, describe stylish athletic sneakers.
   - If the request is about tech/smartphone, describe the sleek mobile device.
   - If the request is about skincare, describe the luxurious cosmetic serum bottle.
   - If the request is about hotels/travel, describe the stunning resort infinity pool terrace.
2. The headline and subheadline MUST be 100% relevant to the requested product and offer. Never generate generic gift parcels or unrelated promotions.

Output strictly valid JSON with no markdown wrapping:
{
  "brandName": "Brand name if identified, else empty string",
  "industry": "${explicitIndustry || profile.mood.split(' ')[0]}",
  "category": "${category}",
  "layout": "${profile.layout}",
  "headline": "Punchy 3-6 word advertising headline specifically featuring the product and exact offer (e.g. '${strictOffer ? strictOffer + ' on ' + (category === 'samosa' ? 'Samosas' : 'Special Selection') : 'Special Promotional Offer'}')",
  "subheadline": "Persuasive 6-12 word supporting value line strictly about this product. Never invent bank offers, EMI, or fake claims.",
  "offer": "${strictOffer || ''}",
  "cta": "High-converting action button text (e.g. 'Order Now →', 'Shop Now →', 'Claim Offer →')",
  "targetAudience": "Target audience description",
  "colorPalette": "${profile.colors}",
  "visualSubject": "${profile.heroSubject}",
  "visualSetting": "${profile.setting}"
}`;

  let analysis = null;

  try {
    const jsonRes = await AIProviderService.generateStructuredJson({
      prompt,
      systemPrompt: 'You are an elite commercial advertising director. Output raw valid JSON only.',
      task: 'strategy',
      customApiKey,
    });

    if (jsonRes.data && (jsonRes.data.headline || jsonRes.data.visualSubject)) {
      analysis = jsonRes.data;
      analysis._aiProvider = jsonRes.provider;
    }
  } catch (err) {
    console.warn('[PosterIntelligence] LLM analysis notice:', err.message);
  }

  // Deterministic high-precision fallback
  if (!analysis) {
    const words = description.split(/\s+/).filter(Boolean);
    const potentialBrand = words.find(w => w.length > 2 && /^[A-Z]/.test(w) && !['Special', 'Diwali', 'Summer', 'Winter', 'New', 'Fresh', 'Hot', 'Get'].includes(w)) || '';

    let headline = strictOffer ? `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer} Special` : `${potentialBrand ? potentialBrand + ' ' : ''}Special Campaign`;
    let subheadline = strictOffer
      ? `Enjoy ${strictOffer} on ${potentialBrand ? potentialBrand + ' ' : ''}${category !== 'default' ? category : 'our collection'}. Premium quality at limited-time promotional pricing.`
      : `Discover authentic craftsmanship and exceptional performance with ${potentialBrand || 'our collection'} designed for ${description}.`;
    let offer = strictOffer || '';
    let cta = 'Shop Now →';

    const lower = description.toLowerCase();

    if (lower.includes('samosa')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer ? strictOffer + ' on ' : ''}Crispy Samosas`.trim();
      subheadline = 'Hot, freshly fried golden samosas filled with savory spiced potatoes and served with tangy chutneys.';
      cta = 'Order Hot & Fresh →';
    } else if (lower.includes('pizza')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || 'Special'} Artisanal Pizzas`.trim();
      subheadline = 'Hot, freshly stone-baked artisanal pizzas loaded with rich melted cheese and savory toppings.';
      cta = 'Order Hot & Fresh →';
    } else if (lower.includes('burger')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || 'Special'} Gourmet Burgers`.trim();
      subheadline = 'Juicy flame-grilled patties, melted cheddar, crisp lettuce, and toasted brioche buns.';
      cta = 'Order Deliciously →';
    } else if (lower.includes('coffee') || lower.includes('cafe')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || 'Artisanal'} Fresh Brewed Coffee`.trim();
      subheadline = 'Freshly roasted beans, velvety espresso crema, and authentic barista perfection.';
      cta = 'Order Your Cup →';
    } else if (lower.includes('sneaker') || lower.includes('shoe')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || '40% OFF'} on Sneakers`.trim();
      subheadline = 'Engineered for comfort, performance, and unmatched streetwear style.';
      cta = 'Shop Sneakers →';
    } else if (lower.includes('smartphone') || lower.includes('phone')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}Next-Gen Smartphone Launch`.trim();
      subheadline = 'Experience revolutionary curved OLED clarity, pro camera sensors, and ultra-fast speed.';
      cta = 'Discover Innovation →';
    } else if (lower.includes('skincare') || lower.includes('serum') || lower.includes('beauty')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || 'Exclusive'} Radiant Skincare`.trim();
      subheadline = 'Nourish your skin with ultra-pure botanical serums and clinical age-defying formulas.';
      cta = 'Claim Your Glow →';
    } else if (lower.includes('hotel') || lower.includes('resort') || lower.includes('travel') || lower.includes('holiday')) {
      headline = `${potentialBrand ? potentialBrand + ' ' : ''}${strictOffer || 'Luxury'} Holiday Gateway`.trim();
      subheadline = 'Escape to sun-drenched private villas, crystalline infinity pools, and five-star tranquility.';
      cta = 'Book Your Stay →';
    }

    analysis = {
      brandName: potentialBrand,
      industry: explicitIndustry || (category !== 'default' ? category : 'Commercial'),
      category,
      layout: profile.layout,
      headline,
      subheadline,
      offer,
      cta,
      targetAudience: 'Customers and brand enthusiasts',
      colorPalette: profile.colors,
      visualSubject: profile.heroSubject,
      visualSetting: profile.setting,
      _aiProvider: 'zenvora-engine-v2',
    };
  }

  // Enforce strict offer override (NEVER let discount be inflated)
  if (strictOffer) {
    analysis.offer = strictOffer;
    if (analysis.headline && !analysis.headline.toUpperCase().includes(strictOffer)) {
      analysis.headline = `${analysis.brandName ? analysis.brandName + ' ' : ''}${strictOffer} Special`.trim();
    }
  }

  if (analysis.subheadline) {
    analysis.subheadline = sanitizeGeneratedText(analysis.subheadline, strictOffer, description);
  }

  return analysis;
}

// ── Craft Dynamic Photographic Advertising Scene Prompt ───────────────────────
export function generatePosterPrompt(analysis, researchData = {}, styleOverride = '') {
  const {
    category = 'default',
    colorPalette = '',
    visualSubject = '',
    visualSetting = '',
  } = analysis;

  const profile = CATEGORY_SUBJECT_PROFILES[category] || CATEGORY_SUBJECT_PROFILES.default;
  const subject = visualSubject || profile.heroSubject;
  const setting = visualSetting || profile.setting;
  const colors = colorPalette || profile.colors;

  // Style adaptation
  let styleDetail = 'commercial advertising studio photography, shot on Hasselblad H6D-100c, 85mm f/2.8 lens';
  if (styleOverride) {
    const sLow = styleOverride.toLowerCase();
    if (sLow.includes('luxury') || sLow.includes('gold')) {
      styleDetail = 'luxury commercial advertising aesthetic, opulent warm golden rim highlights, dark rich background with refined depth, premium dining and lifestyle presentation';
    } else if (sLow.includes('cinematic')) {
      styleDetail = 'cinematic chiaroscuro film lighting, anamorphic lens flare, 35mm panavision aesthetic';
    } else if (sLow.includes('minimal')) {
      styleDetail = 'ultra-clean minimalist architectural cyclorama, soft diffused natural daylight, neutral stone';
    } else if (sLow.includes('editorial') || sLow.includes('lifestyle')) {
      styleDetail = 'high-fashion lifestyle editorial photography, natural daylight, Vogue aesthetic';
    }
  }

  const peopleConstraint = profile.allowPeople
    ? 'natural authentic human models with confident expressions'
    : 'strictly still life commercial product photography, strictly no people, no portraits, no human faces';

  // Construct prompt with HERO SUBJECT FIRST
  const parts = [
    `Professional commercial advertising photograph featuring ${subject}`,
    setting,
    `color palette: ${colors}`,
    styleDetail,
    'balanced composition with dedicated negative space for advertising typography layout',
    'masterpiece, ultra-sharp 8k resolution, authentic realistic textures, perfect physical depth of field',
    'strictly centered product hero shot, strictly no storefront, no building exterior, no street, no shop window, no empty dark room',
    'strictly no computers, no motherboards, no electronics, no circuit boards unless specifically requested',
    'strictly no watermarks, no overlaid text',
    peopleConstraint,
  ].filter(Boolean);

  return parts.join('. ');
}

// ── Build Structured Design Specification ───────────────────────────────────
export function buildDesignSpec(analysis, research = {}) {
  const profile = CATEGORY_SUBJECT_PROFILES[analysis.category] || CATEGORY_SUBJECT_PROFILES.default;

  return {
    detectedCategory: analysis.category || 'commercial',
    brandName: analysis.brandName || '',
    industry: analysis.industry || research.industry || 'General',
    headline: analysis.headline || '',
    subheadline: analysis.subheadline || '',
    offer: analysis.offer || '',
    cta: analysis.cta || 'Shop Now →',
    layout: analysis.layout || profile.layout || 'product-focused',
    targetAudience: analysis.targetAudience || 'General Audience',
    colorPalette: analysis.colorPalette || profile.colors,
    mood: profile.mood || 'Professional',
    officialWebsite: analysis.officialWebsite || research.officialWebsite || '',
  };
}

// ── Validate Poster Output Against Campaign Brief ────────────────────────────
export function validatePosterOutput(output, originalOffer = '') {
  const errors = [];
  const offer = output?.designSpec?.offer || output?.analysis?.offer || '';
  const headline = output?.designSpec?.headline || output?.analysis?.headline || '';

  if (originalOffer) {
    const numMatch = originalOffer.match(/(\d{1,3})%/);
    if (numMatch) {
      const allowed = numMatch[1];
      const wrongOfferRegex = new RegExp(`(?:up\\s+to\\s+)?(?!${allowed}%)\\b\\d{1,3}%`, 'i');
      if (wrongOfferRegex.test(offer) || wrongOfferRegex.test(headline)) {
        errors.push(`Conflicting discount in poster spec: expected "${originalOffer}".`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default {
  analyzeInput,
  generatePosterPrompt,
  buildDesignSpec,
  validatePosterOutput,
  fetchBrandLogo,
  detectCategory,
  CATEGORY_KEYWORDS,
  CATEGORY_SUBJECT_PROFILES,
};
