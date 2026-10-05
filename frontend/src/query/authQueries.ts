import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";
import { authKeys } from "./authKeys";

export const authQueries = {
  me: () => queryOptions({
      queryKey: authKeys.me(),
      queryFn: getCurrentUser,
  }),
};