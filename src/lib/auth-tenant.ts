import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getTenantDb, getCompanyBySlugOrId } from "./db/db";
import * as schema from "./db/schema-tenant";

export const getAuthTenant = (slugOrId: string) => {
  const company = getCompanyBySlugOrId(slugOrId);
  if (!company) {
    throw new Error(`Company not found: ${slugOrId}`);
  }
  const companyId = company.id;
  
  const db = getTenantDb(companyId);
  return betterAuth({
    basePath: `/api/auth/tenant/${slugOrId}`,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      cookiePrefix: `mahfza_tenant_${companyId}`,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "employee",
        },
      },
    },
  });
};
