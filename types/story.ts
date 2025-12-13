export interface StoryNode {
  id: string;
  parentNodeId: string | null;
  actionType: string;
  userInput: string;
  generatedText: string;
  tokenStart: number;
  tokenEnd: number;
  createdAt: string;
}

export interface Story {
  id: string;
  genre: string;
  protagonist: string;
  matureEnabled: boolean;
  createdAt: string;
  nodes: StoryNode[];
}

export interface StoryListItem {
  id: string;
  genre: string;
  protagonist: string;
  createdAt: string;
  updatedAt: string;
}
