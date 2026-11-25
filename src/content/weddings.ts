/* The Weddings page: the reels in the order a wedding happens, the two things couples book us for,
   and why they pick us. Reel ids are their numbers in /REELS (see scripts/build-reels.mjs). */

export type WeddingReel = {
  /** The reel's number in /REELS, the key into WEDDING_REEL_FILES. */
  id: string;
  /** The function or moment, shown as the card's tag. */
  moment: string;
  /** The reel's own hook line, as it appears on screen. */
  hook: string;
};

export type WeddingChapter = {
  id: string;
  /** Which of the two services this chapter belongs to. */
  kind: 'Pre-wedding' | 'Wedding';
  title: string;
  /** The functions it covers, for the chapter card. */
  rituals: readonly string[];
  reels: readonly WeddingReel[];
};

export const WEDDING_CHAPTERS: readonly WeddingChapter[] = [
  {
    id: 'before',
    kind: 'Pre-wedding',
    title: 'Before the big day',
    rituals: ['Haldi', 'Mehendi', 'Garba night'],
    reels: [
      { id: '50', moment: 'Haldi', hook: 'You decided to have a fun haldi' },
      { id: '41', moment: 'Mehendi', hook: 'Moods of the bride during mehendi' },
      { id: '42', moment: 'Mehendi', hook: 'Mehendi… but with a surprise' },
      { id: '51', moment: 'Garba night', hook: 'Khamma!' },
      { id: '53', moment: 'Getting ready', hook: 'The bridesmaids, ft. their inner thoughts' }
    ]
  },
  {
    id: 'arrival',
    kind: 'Wedding',
    title: 'The arrival',
    rituals: ['First look', 'Baraat', 'Entries'],
    reels: [
      { id: '35', moment: 'First look', hook: 'Proof that even the groom’s friends deserve a first look' },
      { id: '47', moment: 'Baraat', hook: 'Ladkewaale hai, baaraat toh…' },
      { id: '34', moment: 'Baraat', hook: 'The groom’s side vs. the bride’s side' },
      { id: '44', moment: 'Entry', hook: 'Bhabhi kahaan hai???' },
      { id: '40', moment: 'Entry', hook: 'A banger entry' }
    ]
  },
  {
    id: 'vows',
    kind: 'Wedding',
    title: 'The vows',
    rituals: ['Pheras', 'Sindoor', 'Bidaai'],
    reels: [
      { id: '52', moment: 'Pheras', hook: 'The groom side during the pheras' },
      { id: '49', moment: 'Sindoor', hook: 'Adding the colour to his life' },
      { id: '39', moment: 'The tears', hook: 'Who will cry the most during the wedding' },
      { id: '43', moment: 'The tears', hook: 'From “tere shaadi mei nahi royenge”…' },
      { id: '54', moment: 'Sisters', hook: 'She grew up with you, and now sees you grow old' }
    ]
  },
  {
    id: 'after',
    kind: 'Wedding',
    title: 'Happily ever after',
    rituals: ['Reception', 'The family', 'The friends'],
    reels: [
      { id: '46', moment: 'Reception', hook: 'POV: you waited so long, and it was over in a blink' },
      { id: '45', moment: 'The family', hook: 'Us: Bhabhi, it’s not easy to handle our family' },
      { id: '48', moment: 'The friends', hook: 'They saved a million reels to recreate' }
    ]
  }
];

export type WeddingService = {
  id: string;
  kind: WeddingChapter['kind'];
  title: string;
  summary: string;
  includes: readonly string[];
};

export const WEDDING_SERVICES: readonly WeddingService[] = [
  {
    id: 'pre-wedding',
    kind: 'Pre-wedding',
    title: 'Pre-wedding content',
    summary: 'The build-up, filmed like the main event. A shoot of the two of you, and every function before the big day.',
    includes: [
      'A pre-wedding shoot, planned around your story',
      'Haldi, mehendi, sangeet and garba nights',
      'Save-the-date and countdown reels',
      'The friends, the dances and the surprises'
    ]
  },
  {
    id: 'wedding',
    kind: 'Wedding',
    title: 'Wedding content',
    summary: 'From the baraat to the bidaai: the rituals, the entries, the tears and the chaos in between.',
    includes: [
      'Baraat, entries and varmala',
      'Pheras, sindoor and the family moments',
      'Reception and the after-party',
      'Reels cut for Instagram, ready to post'
    ]
  }
];

export const WEDDING_REASONS = [
  {
    title: 'Hooks, not just highlights',
    /** A reel on the page that shows it. */
    proof: '44',
    text: 'Every reel opens with a reason to keep watching: a joke, a question, a POV. People watch to the end, then send it on.'
  },
  {
    title: 'We film the people around you',
    proof: '43',
    text: 'The friends, the siblings, the aunties who said they wouldn’t cry. That’s where the best stories at a wedding are.'
  },
  {
    title: 'A social media team, not just a camera',
    proof: '48',
    text: 'We make reels for brands every day, so yours are paced, captioned and set to music for the feed, not an album.'
  }
] as const;

export const WEDDING_STEPS = [
  'Tell us your dates and functions',
  'We plan the reels with you',
  'We shoot, edit and hand them over'
] as const;

/* Every reel on the page, in order. */
export const WEDDING_REELS: readonly WeddingReel[] = WEDDING_CHAPTERS.flatMap((chapter) => chapter.reels);
