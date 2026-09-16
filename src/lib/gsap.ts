"use client";

/**
 * GSAP REGISTRATION
 * ---------------------------------------------------------------------------
 * One module owns plugin registration for the whole site. Registering in each
 * component is how a project ends up with a plugin that works on the page it
 * was written for and silently no-ops on the next one.
 *
 * `"use client"` is load-bearing: registration runs as an import side effect,
 * and GSAP touches `document` while doing it. A server component importing
 * this would execute that during the render pass on the server.
 *
 * Every plugin here ships inside the public `gsap` package as of 3.13 — since
 * Webflow's acquisition there is no Club tier, no auth token and no private
 * registry. If a future task suggests adding an `.npmrc` for GreenSock, that
 * instruction is out of date.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
