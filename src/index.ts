import { getCompletions } from "./slices/phala/service";

const message = "Hello, world!";
const completions = await getCompletions([{ role: "user", content: message }]);
console.log(completions.toString());
