import { http, HttpResponse } from "msw";
import { addFavorite, listFavorites, removeFavorite, requireUser } from "@/mocks/db";
import { bearerToken, errorResponse } from "./respond";

export const favoritesHandlers = [
  http.get("/api/favorites", ({ request }) => {
    try {
      const user = requireUser(bearerToken(request));
      return HttpResponse.json({ items: listFavorites(user.id) });
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.post("/api/favorites/:nftId", ({ request, params }) => {
    try {
      const user = requireUser(bearerToken(request));
      addFavorite(user.id, String(params.nftId));
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.delete("/api/favorites/:nftId", ({ request, params }) => {
    try {
      const user = requireUser(bearerToken(request));
      removeFavorite(user.id, String(params.nftId));
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
