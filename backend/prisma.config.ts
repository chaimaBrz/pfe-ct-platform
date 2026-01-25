import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://ct_user:ct_pass@localhost:5432/ct_platform",
  },
});
