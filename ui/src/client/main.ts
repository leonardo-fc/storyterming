import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { fail } from "~/shared/fail";

const app = mount(App, {
  target: document.getElementById("app") ?? fail(),
});

export default app;
