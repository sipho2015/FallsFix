import { forwardToBackend } from "@/frontend/server/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export {
  forwardToBackend as GET,
  forwardToBackend as POST,
  forwardToBackend as PUT,
  forwardToBackend as PATCH,
  forwardToBackend as DELETE,
  forwardToBackend as HEAD,
  forwardToBackend as OPTIONS,
};
