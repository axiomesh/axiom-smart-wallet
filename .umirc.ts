import { defineConfig } from "umi";
import {index} from "./src/routers";

export default defineConfig({
  routes: index,
  npmClient: 'yarn',
});
