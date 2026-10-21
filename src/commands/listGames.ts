import { MyContext } from "../types.ts";
import { getGamesConfig } from "../utils/index.ts";

interface ResponseGame {
  id: number;
  title: string;
}

interface RequestGameList{
  game: string[]
} 


export async function listGames(ctx: MyContext) {
  
  
  
}
