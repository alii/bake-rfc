// SKETCH. Runs on the server. The plugin's stubs import this.
import { registerClientReference } from "flight-placeholder/server";

/** Every client file this server has reached so far. */
export const reached = new Set<string>();

export function reference(id: string, name: string) {
  reached.add(id);
  return registerClientReference(() => {
    throw new Error("client code called on the server");
  }, id, name);
}
