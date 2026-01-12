export interface IconBoundaries {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GetIconPropsFn = {
  (id: string): IconBoundaries;
  (id: string, count?: number): IconBoundaries[];
};

export const versionTypeTitles: Record<string, string> = {
  og: 'Original',
  oz: 'Reborn',
};

export const tagsReplaces: Record<string, string> = {
  sapper: 'strong',
};
