import { defineAsyncComponent } from "vue";

// One page per block. Each configuration is loaded only when its page opens.
export const BLOCK_CAMPAIGN_PAGES = {
  "101": defineAsyncComponent(() => import("./BlockCampaignPage101.vue").then((module) => module.default)),
  "102": defineAsyncComponent(() => import("./BlockCampaignPage102.vue").then((module) => module.default)),
  "103": defineAsyncComponent(() => import("./BlockCampaignPage103.vue").then((module) => module.default)),
  "104": defineAsyncComponent(() => import("./BlockCampaignPage104.vue").then((module) => module.default)),
  "105": defineAsyncComponent(() => import("./BlockCampaignPage105.vue").then((module) => module.default)),
  "106": defineAsyncComponent(() => import("./BlockCampaignPage106.vue").then((module) => module.default)),
  "107": defineAsyncComponent(() => import("./BlockCampaignPage107.vue").then((module) => module.default)),
  "201": defineAsyncComponent(() => import("./BlockCampaignPage201.vue").then((module) => module.default)),
  "202": defineAsyncComponent(() => import("./BlockCampaignPage202.vue").then((module) => module.default)),
  "203": defineAsyncComponent(() => import("./BlockCampaignPage203.vue").then((module) => module.default)),
  "204": defineAsyncComponent(() => import("./BlockCampaignPage204.vue").then((module) => module.default)),
  "205": defineAsyncComponent(() => import("./BlockCampaignPage205.vue").then((module) => module.default)),
  "206": defineAsyncComponent(() => import("./BlockCampaignPage206.vue").then((module) => module.default)),
  "207": defineAsyncComponent(() => import("./BlockCampaignPage207.vue").then((module) => module.default)),
  "301": defineAsyncComponent(() => import("./BlockCampaignPage301.vue").then((module) => module.default)),
  "302": defineAsyncComponent(() => import("./BlockCampaignPage302.vue").then((module) => module.default)),
  "303": defineAsyncComponent(() => import("./BlockCampaignPage303.vue").then((module) => module.default)),
  "304": defineAsyncComponent(() => import("./BlockCampaignPage304.vue").then((module) => module.default)),
  "305": defineAsyncComponent(() => import("./BlockCampaignPage305.vue").then((module) => module.default)),
  "306": defineAsyncComponent(() => import("./BlockCampaignPage306.vue").then((module) => module.default)),
  "307": defineAsyncComponent(() => import("./BlockCampaignPage307.vue").then((module) => module.default)),
  "308": defineAsyncComponent(() => import("./BlockCampaignPage308.vue").then((module) => module.default)),
  "309": defineAsyncComponent(() => import("./BlockCampaignPage309.vue").then((module) => module.default)),
};
