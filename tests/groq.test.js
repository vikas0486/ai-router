import "dotenv/config";
import { groq } from "../providers/groq.js";

const res = await groq("Say hello in one line");
console.log(res);