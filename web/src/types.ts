export type Media = { url: string; type?: string; thumbUrl?: string; w?: number; h?: number };

export type Memory = {
  id: string; title: string; date: string; time: string; location: string; mood: string; weather: string;
  story: string; favoriteMoment: string; funnyMoment: string; food: string; songs: string; insideJokes: string;
  rating: number; notesA: string; notesB: string; media: Media[]; reactions: { by: number; emoji: string }[];
  tags: string[]; isFavorite: boolean; createdAt: string;
};

export type Milestone = { id: string; title: string; date: string; description: string; location: string; tags: string[]; media: Media[] };

export type HomeData = {
  users: { id: number; name: string; avatarUrl: string }[];
  startDate: string; daysTogether: number; yearsTogether: number; monthsTogether: number;
  nextAnniversary: { date: string; inDays: number; year: number };
  latest: Memory | null; onThisDay: Memory[]; upcomingMilestone: Milestone | null;
  featuredPhoto: Media | null; quote: string;
  stats: { memories: number; photos: number; videos: number };
};
