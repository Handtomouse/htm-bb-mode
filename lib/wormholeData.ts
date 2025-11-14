// Destination categories - all verified and fast-loading
export const DESTINATIONS = {
  interactive: [
    "https://neal.fun/deep-sea/",
    "https://neal.fun/infinite-craft/",
    "https://www.koalastothemax.com",
    "https://weavesilk.com",
    "https://thisissand.com",
    "https://www.windows93.net",
    "https://zoomquilt.org",
    "https://lab.hakim.se",
    "https://oimo.io/works",
    "https://stars.chromeexperiments.com",
  ],
  games: [
    "https://slither.io",
    "https://agar.io",
    "https://typeracer.com",
    "https://geoguessr.com/free",
    "https://globle-game.com",
    "https://worldle.teuteuf.fr",
    "https://semantle.com",
    "https://travle.earth",
  ],
  weirdFun: [
    "https://pointerpointer.com",
    "https://www.staggeringbeauty.com",
    "https://findtheinvisiblecow.com",
    "https://heeeeeeeey.com",
    "https://cant-not-tweet-this.com",
    "https://thezen.zone",
    "https://www.omfgdogs.com",
    "https://cat-bounce.com",
    "https://corndogoncorndog.com",
    "https://ducksarethebest.com",
    "https://checkboxrace.com",
    "https://eelslap.com",
  ],
  music: [
    "https://radiooooo.com",
    "https://everynoise.com",
    "https://musicmap.info",
    "https://www.incredibox.com",
    "https://patatap.com",
    "https://typatone.com",
    "https://www.music-map.com",
    "https://pudding.cool/2018/05/similarity/",
  ],
  educational: [
    "https://artsandculture.google.com/project/gigapixels",
    "https://experiments.withgoogle.com",
    "https://www.opte.org/the-internet",
    "https://ncase.me/polygons",
    "https://ncase.me/trust",
    "https://worldometers.info",
    "https://www.ventusky.com",
    "https://earth.nullschool.net",
    "https://neal.fun/space-elevator/",
    "https://neal.fun/universe-forecast/",
  ],
  retro: [
    "https://www.spacejam.com/1996",
    "https://www.cameronsworld.net",
    "https://wiby.me/surprise",
    "https://theoldnet.com",
    "https://www.poolsuite.net",
    "https://www.donothingfor2minutes.com",
  ],
};

// Easter eggs (1% chance)
export const EASTER_EGGS = [
  "https://www.zombo.com",
  "https://www.therevolvinginternet.com",
  "https://archive.org/details/msdos_Oregon_Trail_The_1990",
  "https://orteil.dashnet.org/nested",
];

// Countdown messages
export const COUNTDOWN_MESSAGES = [
  "Preparing your journey",
  "Opening the gateway",
  "Bending spacetime",
  "Charting your course",
  "Gathering momentum",
  "Initiating transfer",
  "Transcending boundaries",
];

// Destination hints
export const DESTINATION_HINTS: Record<string, string[]> = {
  interactive: ["Interactive", "Dynamic", "Immersive", "Whimsical", "Generative"],
  games: ["Strategic", "Competitive", "Reflex-Based", "Puzzle", "Challenge"],
  weirdFun: ["Peculiar", "Unconventional", "Chaotic", "Strange", "Wonderfully Odd"],
  music: ["Sonic", "Melodic", "Harmonic", "Rhythmic", "Auditory"],
  educational: ["Enlightening", "Infinite", "Visual", "Cosmic", "Scientific"],
  retro: ["Nostalgic", "Vintage", "Classic", "Timeless", "Heritage"],
};

// Performance constants - extracted to module level to prevent re-allocation
export const PARALLAX_MULTIPLIERS = [0.3, 0.6, 1.0] as const; // Layer 0 = slowest, Layer 2 = fastest
export const LAYER_SIZE_MULTIPLIERS = [0.8, 1.2, 1.6] as const;
export const LAYER_OPACITY_MULTIPLIERS = [0.5, 0.8, 1] as const;
export const SPEED_LINE_COUNT = 12;
export const SPEED_LINE_INDICES = Array.from({ length: SPEED_LINE_COUNT }, (_, i) => i);
