import type { Prisma } from "@prisma/client";

export type Account = {
  account_id?: string;
  auth_key?: string;
  domain_key?: string;
  search_page_url?: string;
  multicurrency_enabled?: boolean;
};

export type Recommendations = {
  endpoint?: string;
  fl_fields?: string;
};

export type Store = Prisma.Result<typeof prisma.store, Prisma.Args<typeof prisma.store, 'findUniqueOrThrow'>, 'findUniqueOrThrow'>;
