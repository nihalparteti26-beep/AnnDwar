/**
 * English to Hindi (Devanagari) Phonetic Transliteration Engine
 * Converts typed Romanized phonetic English into natural Hindi Devanagari text.
 * e.g. "Ramesh Patel" -> "रमेश पटेल", "Vikram Singh" -> "विक्रम सिंह"
 */

// Dictionary of high-frequency Indian farmer names, castes, and locations
const NAME_DICTIONARY: Record<string, string> = {
  // First Names
  ram: 'राम',
  rama: 'राम',
  ramesh: 'रमेश',
  suresh: 'सुरेश',
  mahesh: 'महेश',
  dinesh: 'दिनेश',
  mukesh: 'मुकेश',
  rajesh: 'राजेश',
  kamal: 'कमल',
  kishore: 'किशोर',
  vikram: 'विक्रम',
  shyam: 'श्याम',
  shyamlal: 'श्यामलाल',
  radhe: 'राधे',
  radheshyam: 'राधेश्याम',
  balram: 'बलराम',
  shiv: 'शिव',
  shivraj: 'शिवराज',
  mohan: 'मोहन',
  sohan: 'सोहन',
  kishan: 'किशन',
  kisan: 'किसान',
  bhawar: 'भंवर',
  bhanwar: 'भंवर',
  bhawarlal: 'भंवरलाल',
  bhanwarlal: 'भंवरलाल',
  jagdish: 'जगदीश',
  dharmendra: 'धर्मेन्द्र',
  santosh: 'संतोष',
  anil: 'अनिल',
  sunil: 'सुनील',
  vinod: 'विनोद',
  ashok: 'अशोक',
  om: 'ओम',
  omprakash: 'ओमप्रकाश',
  prakash: 'प्रकाश',
  deepak: 'दीपक',
  rohit: 'रोहित',
  rahul: 'राहुल',
  amit: 'अमित',
  sumit: 'सुमित',
  manoj: 'मनोज',
  jitendra: 'जितेन्द्र',
  hira: 'हीरा',
  hiralal: 'हीरालाल',
  ramlal: 'रामलाल',
  moolchand: 'मूलचंद',
  kailash: 'कैलाश',
  govind: 'गोविंद',
  harish: 'हरीश',
  lakhan: 'लखन',
  nandlal: 'नंदलाल',
  bharat: 'भरत',
  bhagwan: 'भगवान',
  satyanarayan: 'सत्यनारायण',
  vijay: 'विजय',
  arjun: 'अर्जुन',
  ajay: 'अजय',
  sanjay: 'संजय',
  devendra: 'देवेन्द्र',
  gopal: 'गोपाल',

  // Surnames / Titles
  patel: 'पटेल',
  patidar: 'पाटीदार',
  singh: 'सिंह',
  sharma: 'शर्मा',
  verma: 'वर्मा',
  yadav: 'यादव',
  joshi: 'जोशी',
  choudhary: 'चौधरी',
  chaudhary: 'चौधरी',
  mewada: 'मेवाड़ा',
  gurjar: 'गुर्जर',
  thakur: 'ठाकुर',
  rajput: 'राजपूत',
  malviya: 'मालवीय',
  malviy: 'मालवीय',
  solanki: 'सोलंकी',
  jat: 'जाट',
  gupta: 'गुप्ता',
  tiwari: 'तिवारी',
  pandey: 'पांडेय',
  mishra: 'मिश्रा',
  kumar: 'कुमार',
  chouhan: 'चौहान',
  chauhan: 'चौहान',
  bhati: 'भाटी',
  panwar: 'पंवार',
  rathore: 'राठौड़',
  sisodiya: 'सिसोदिया',
  gehlot: 'गहलोत',
  meena: 'मीणा',
  lodhi: 'लोधी',
  dangi: 'दांगी',
  ahirwar: 'अहिरवार',
  parihar: 'परिहार',
  khatri: 'खत्री',
  saxena: 'सक्सेना',
  shrivastava: 'श्रीवास्तव',
  tiwariji: 'तिवारी',

  // Places & Common Words
  indore: 'इन्दौर',
  sanwer: 'सांवेर',
  dewas: 'देवास',
  ujjain: 'उज्जैन',
  bhopal: 'भोपाल',
  dhar: 'धार',
  mhow: 'महू',
  betma: 'बेटमा',
  depalpur: 'देपालपुर',
  kisanbhai: 'किसान भाई',
  gram: 'ग्राम',
  gaon: 'गांव',
  mandi: 'मंडी'
};

// Consonant sound mappings (longest matches first)
const CONSONANTS: Array<[string, string]> = [
  ['shh', 'ष'],
  ['chh', 'छ'],
  ['kh', 'ख'],
  ['gh', 'घ'],
  ['ch', 'च'],
  ['jh', 'झ'],
  ['th', 'थ'],
  ['dh', 'ध'],
  ['ph', 'फ'],
  ['bh', 'भ'],
  ['sh', 'श'],
  ['gy', 'ज्ञ'],
  ['tr', 'त्र'],
  ['k', 'क'],
  ['g', 'ग'],
  ['j', 'ज'],
  ['t', 'त'],
  ['d', 'द'],
  ['n', 'न'],
  ['p', 'प'],
  ['f', 'फ'],
  ['b', 'ब'],
  ['m', 'म'],
  ['y', 'य'],
  ['r', 'र'],
  ['l', 'ल'],
  ['v', 'व'],
  ['w', 'व'],
  ['s', 'स'],
  ['h', 'ह'],
  ['q', 'क'],
  ['x', 'क्स'],
  ['z', 'ज़']
];

// Vowel matra mappings (attached to preceding consonant)
const VOWEL_MATRAS: Array<[string, string]> = [
  ['aai', 'ाई'],
  ['aau', 'ाऊ'],
  ['aa', 'ा'],
  ['ee', 'ी'],
  ['oo', 'ू'],
  ['ai', 'ै'],
  ['au', 'ौ'],
  ['ou', 'ौ'],
  ['ii', 'ी'],
  ['uu', 'ू'],
  ['i', 'ि'],
  ['u', 'ु'],
  ['e', 'े'],
  ['o', 'ो'],
  ['a', 'ा']
];

// Standalone initial vowels
const INITIAL_VOWELS: Array<[string, string]> = [
  ['aa', 'आ'],
  ['ai', 'ऐ'],
  ['au', 'औ'],
  ['ee', 'ई'],
  ['oo', 'ऊ'],
  ['a', 'अ'],
  ['i', 'इ'],
  ['u', 'उ'],
  ['e', 'ए'],
  ['o', 'ओ']
];

/**
 * Phonetically transliterates a single English word to Hindi
 */
export function transliterateWord(word: string): string {
  if (!word || word.trim() === '') return '';
  const clean = word.toLowerCase().trim();

  // 1. Direct dictionary check
  if (NAME_DICTIONARY[clean]) {
    return NAME_DICTIONARY[clean];
  }

  let result = '';
  let i = 0;
  let isStartOfSyllable = true;

  while (i < clean.length) {
    // Check nasal sound "n" or "m" followed by consonant or end
    if ((clean[i] === 'n' || clean[i] === 'm') && i > 0 && (i === clean.length - 1 || !'aeiou'.includes(clean[i + 1]))) {
      // If at end or before another consonant, could be anusvara
      if (i === clean.length - 1 && result.length > 0 && !result.endsWith('ं')) {
        result += 'न';
        i++;
        continue;
      }
    }

    // If at start or standalone vowel
    if (isStartOfSyllable && 'aeiou'.includes(clean[i])) {
      let matchedVowel = false;
      for (const [eng, dev] of INITIAL_VOWELS) {
        if (clean.substring(i).startsWith(eng)) {
          result += dev;
          i += eng.length;
          matchedVowel = true;
          isStartOfSyllable = false;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    // Match Consonant
    let matchedConsonant = false;
    for (const [eng, dev] of CONSONANTS) {
      if (clean.substring(i).startsWith(eng)) {
        i += eng.length;
        matchedConsonant = true;

        // Look ahead for vowel matra
        let matchedMatra = false;
        for (const [vEng, vDev] of VOWEL_MATRAS) {
          if (clean.substring(i).startsWith(vEng)) {
            // "a" at the end of a word is often schwa (not matra), e.g. "Ram" vs "Rama"
            if (vEng === 'a') {
              if (i + 1 === clean.length) {
                // word ending in single 'a' like 'Rama' or 'Patna' -> add matra
                result += dev + 'ा';
              } else {
                // Internal 'a' is inherent schwa, just consonant
                result += dev;
              }
            } else {
              result += dev + vDev;
            }
            i += vEng.length;
            matchedMatra = true;
            break;
          }
        }

        // If consonant has no vowel immediately after
        if (!matchedMatra) {
          // If followed by another consonant and not at the end, could be half letter
          if (i < clean.length && !'aeiou'.includes(clean[i])) {
            // Half consonant representation or virama
            result += dev + '्';
          } else {
            // Standalone consonant at the end
            result += dev;
          }
        }

        isStartOfSyllable = false;
        break;
      }
    }

    // Fallback if character not recognized
    if (!matchedConsonant) {
      result += clean[i];
      i++;
      isStartOfSyllable = true;
    }
  }

  // Clean up any trailing virama
  if (result.endsWith('्')) {
    result = result.slice(0, -1);
  }

  return result;
}

/**
 * Phonetically transliterates a full sentence or multi-word string from English to Hindi
 * Preserves spaces, punctuation, and capitalizations.
 */
export function transliterateToHindi(text: string): string {
  if (!text) return '';
  
  // Split by whitespace preserving tokens
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return token;
      }
      // If it already has Devanagari characters, preserve it
      if (/[\u0900-\u097F]/.test(token)) {
        return token;
      }
      return transliterateWord(token);
    })
    .join('');
}
