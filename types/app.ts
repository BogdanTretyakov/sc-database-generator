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
