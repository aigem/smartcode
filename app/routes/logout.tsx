import type { ActionFunction } from "@remix-run/node";
import { logout } from "~/utils/auth";

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};
