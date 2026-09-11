import { networkGuardHandlers } from "./network-guard";
import { sessionHandlers } from "./session";
import { nftHandlers } from "./nfts";
import { favoritesHandlers } from "./favorites";
import { cartHandlers } from "./cart";
import { quoteHandlers } from "./quote";
import { orderHandlers } from "./orders";
import { profileHandlers } from "./profile";
import { walletsHandlers } from "./wallets";
import { scenarioHandlers } from "./scenario";
import { networkControlHandlers } from "./network";
import { realtimeTestHandlers } from "./realtime";
import { realtimeHandlers } from "@/mocks/realtime/server";

export const handlers = [
  ...networkGuardHandlers,
  ...sessionHandlers,
  ...nftHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...scenarioHandlers,
  ...networkControlHandlers,
  ...realtimeTestHandlers,
  ...realtimeHandlers,
];
