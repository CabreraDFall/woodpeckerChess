export interface User {
  id: string;
  lichessId?: string;
  chessComId?: string;
  username: string;
  settings: any;
  createdAt: Date;
}

export interface Game {
  id: string;
  externalId?: string;
  source?: string;
  white?: string;
  black?: string;
  result?: string;
  pgn?: string;
  fen?: string;
  userId?: string;
  createdAt: Date;
}

export interface Analysis {
  id: number;
  gameId?: string;
  moveNumber: number;
  fen: string;
  eval?: string;
  depth?: number;
  pv?: string[];
  createdAt: Date;
}
