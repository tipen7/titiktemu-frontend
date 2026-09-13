export type ChatRole = "operator" | "umkm";

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export type ChatResponse = {
  answer: string;
  highlight_grid_ids: string[];
  in_scope: boolean;
};
