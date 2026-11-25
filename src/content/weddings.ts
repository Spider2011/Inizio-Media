/* The Weddings page: the reels in the order a wedding happens, what couples book us for, and why
   they pick us. Reel ids are their numbers in /REELS (see scripts/build-reels.mjs). */

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
    id: 'official',
    kind: 'Pre-wedding',
    title: 'It’s official',
    rituals: ['Engagement', 'Couple shoot', 'Save the date', 'Countdown'],
    reels: [
      { id: '63', moment: 'Engagement', hook: 'From the proposal to the engagement' },
      { id: '58', moment: 'Couple shoot', hook: 'Manifested: “Bhagwaan tumhe sab de aur mujhe TUM”' },
      { id: '59', moment: 'Save the date', hook: 'Save the date' },
      { id: '64', moment: 'Countdown', hook: 'Counting down to 11/11' }
    ]
  },
  {
    id: 'celebrations',
    kind: 'Wedding',
    title: 'The celebrations',
    rituals: ['Haldi', 'Mehendi', 'Sangeet', 'Garba night'],
    reels: [
      { id: '50', moment: 'Haldi', hook: 'You decided to have a fun haldi' },
      { id: '41', moment: 'Mehendi', hook: 'Moods of the bride during mehendi' },
      { id: '42', moment: 'Mehendi', hook: 'Mehendi… but with a surprise' },
      { id: '61', moment: 'Sangeet', hook: 'Your friends picked the last slot of the sangeet, and then the drama unfolds' },
      { id: '51', moment: 'Garba night', hook: 'Khamma!' },
      { id: '62', moment: 'Garba night', hook: 'Locking in for… Beyblade season' },
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
      { id: '57', moment: 'Baraat', hook: 'Welcome to Parth’s baaraat' },
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
    rituals: ['Varmala', 'Pheras', 'Sindoor', 'Bidaai'],
    reels: [
      { id: '56', moment: 'Varmala', hook: '3 years, 6 birthdays, 0 break-ups… we made it' },
      { id: '60', moment: 'Varmala', hook: 'A month since my tabiyat has been taazi with my jeeti hui baazi' },
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
    rituals: ['Reception', 'Guest notes', 'The family', 'The friends'],
    reels: [
      { id: '46', moment: 'Reception', hook: 'POV: you waited so long, and it was over in a blink' },
      { id: '55', moment: 'Guest notes', hook: 'Turned love into a deck they’ll shuffle forever' },
      { id: '45', moment: 'The family', hook: 'Us: Bhabhi, it’s not easy to handle our family' },
      { id: '48', moment: 'The friends', hook: 'They saved a million reels to recreate' }
    ]
  }
];

export type WeddingService = {
  id: string;
  /** The two filmed services match the chapters; design is the printed side of the wedding. */
  kind: WeddingChapter['kind'] | 'Design';
  title: string;
  summary: string;
  includes: readonly string[];
  /** The card's booking link text. */
  cta: string;
};

export const WEDDING_SERVICES: readonly WeddingService[] = [
  {
    id: 'pre-wedding',
    kind: 'Pre-wedding',
    title: 'Pre-wedding content',
    summary: 'The build-up, filmed like the main event: the proposal, a shoot of the two of you, and the news that you are getting married.',
    includes: [
      'A pre-wedding shoot, planned around your story',
      'Save-the-date and countdown reels',
      'The friends, the dances and the surprises'
    ],
    cta: 'Book pre-wedding'
  },
  {
    id: 'wedding',
    kind: 'Wedding',
    title: 'Wedding content',
    summary: 'From the haldi to the bidaai: every function, the rituals, the entries, the tears and the chaos in between.',
    includes: [
      'Haldi, mehendi, sangeet and garba nights',
      'Baraat, entries and varmala',
      'Pheras, sindoor and the family moments',
      'Reception and the after-party',
      'Reels cut for Instagram, ready to post'
    ],
    cta: 'Book wedding'
  },
  {
    id: 'stationery',
    kind: 'Design',
    title: 'Stationery & design',
    summary: 'Everything printed with your names on it, designed by the same team as your reels, so the whole wedding looks like one story.',
    includes: [
      'A wedding logo and monogram',
      'A wedding magazine: your story, in print',
      'Photobooth frames and props',
      'Sunboards for the welcome, the directions and the seating',
      'Printables: invites, menus, tags and favours'
    ],
    cta: 'Book the design'
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
  'We get to know your story and your family',
  'We plan the reels and the trends for each function',
  'We shoot, edit and hand them over'
] as const;

/* Every reel on the page, in order. */
export const WEDDING_REELS: readonly WeddingReel[] = WEDDING_CHAPTERS.flatMap((chapter) => chapter.reels);
