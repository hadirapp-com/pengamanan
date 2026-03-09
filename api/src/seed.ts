import { db } from "./lib/db";
import { users, customers, configs } from "./lib/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Define users to seed
    const usersToSeed = [
      {
        username: "admin",
        password: "admin",
        fullName: "Administrator",
        nik: "",
        role: "admin",
      },
      {
        username: "supervisor",
        password: "password123",
        fullName: "User supervisor",
        nik: "5678",
        role: "supervisor",
      },
      {
        username: "sales",
        password: "password123",
        fullName: "User Sales",
        nik: "3456",
        role: "sales",
      },
      {
        username: "delivery",
        password: "password123",
        fullName: "User Delivery",
        nik: "2345",
        role: "delivery",
      },
      {
        username: "preparation",
        password: "password123",
        fullName: "User preparation",
        nik: "1234",
        role: "preparation",
      },
      {
        username: "supervisor1",
        password: "password123",
        fullName: "Supervisor 1",
        nik: "3214567",
        role: "supervisor",
      },
      {
        username: "user1",
        password: "password123",
        fullName: "User 1",
        nik: "12345",
        role: "user",
      },
    ];

    // Insert users if they don't exist
    for (const user of usersToSeed) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, user.username))
        .limit(1);

      if (existingUser.length === 0) {
        const hashedPassword = await Bun.password.hash(user.password);
        await db.insert(users).values({
          username: user.username,
          password: hashedPassword,
          fullName: user.fullName,
          nik: user.nik,
          role: user.role,
        });
        console.log(`✓ User created: ${user.username} (${user.role})`);
      } else {
        console.log(`− User already exists: ${user.username}`);
      }
    }

    // Define customers to seed
    const customersToSeed = [
      {
        id: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
        name: "PT Honda Prospect Motor",
        address: "Jl. Industri No. 123, Jakarta",
        alias: "HPM",
      },
      {
        id: "34b2b6f3-4bec-4cdd-9d93-dc81f5acb81b",
        name: "PT Mitsubishi Motors Krama Yudha Indonesia",
        address: "Jl. Industri No. 234, Jakarta",
        alias: "MMKI",
      },
    ];

    // Insert customers if they don't exist
    for (const customer of customersToSeed) {
      const existingCustomer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customer.id))
        .limit(1);

      if (existingCustomer.length === 0) {
        await db.insert(customers).values(customer);
        console.log(
          `✓ Customer created: ${customer.alias} - ${customer.name}`,
        );
      } else {
        console.log(`- Customer already exists: ${customer.alias}`);
      }
    }

    // Define configs to seed
    const configsToSeed = [
      {
        id: "ca68ffa7-5772-496f-8d38-d1995d86ed1d",
        key: "REVISION_EMAIL_NOTIF",
        value: ["abdul@hadirapp.com"],
        description: "Email revision notification",
      },
      {
        id: "ea954c90-fd9a-4398-9512-6df4752bf8c7",
        key: "SENTRY_DSN",
        value: "https://bf5cbfc98bf34f712c798c11b072b7b2@o4510961584439296.ingest.us.sentry.io/4510961586995200",
        description: "Sentry DSN untuk error tracking mobile apps",
      },
      {
        id: "16f66a39-a69f-426c-8464-9be7bbb899c5",
        key: "USER_GUIDE",
        value: '[{"link": "http://localhost:5173/test-file.mov", "title": "Print Label", "fileType": "video"}, {"link": "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf", "title": "Example pdf", "fileType": "pdf"}]',
        description: "User Guide"
      }
    ];

    // Insert configs if they don't exist
    for (const config of configsToSeed) {
      const existingConfig = await db
        .select()
        .from(configs)
        .where(eq(configs.key, config.key))
        .limit(1);

      if (existingConfig.length === 0) {
        await db.insert(configs).values(config);
        console.log(
          `✓ Config created: ${config.key} - ${config.description}`,
        );
      } else {
        console.log(`- Config already exists: ${config.key}`);
        await db
          .update(configs)
          .set({ value: config.value, description: config.description })
          .where(eq(configs.key, config.key));
        console.log(
          `✓ Config updated: ${config.key} - ${config.description}`,
        );
      }
    }

    console.log("\n✓ Seed data created successfully!");
    console.log("\n📋 Customers:");
    console.log("┌───────────────────────────────────────┬──────────────┬──────────────┐");
    console.log("│ Name                                  │ Alias        │ ID           │");
    console.log("├───────────────────────────────────────┼──────────────┼──────────────┤");
    console.log("│ PT Honda Prospect Motor               │ HPM          │ ...68e1      │");
    console.log("│ PT Mitsubishi Motors Krama Yudha      │ MMKI         │ ...b81b      │");
    console.log("└───────────────────────────────────────┴──────────────┴──────────────┘");
    console.log("\n⚙️  Configs:");
    console.log("┌───────────────────────────────────────┬──────────────────────────┐");
    console.log("│ Key                                 │ Value                    │");
    console.log("├───────────────────────────────────────┼──────────────────────────┤");
    console.log("│ REVISION_EMAIL_NOTIF                  │ [\"abdul@hadirapp.com\"]  │");
    console.log("│ SENTRY_DSN                           │ https://default-dsn@...  │");
    console.log("└───────────────────────────────────────┴──────────────────────────┘");
    console.log("\n🔐 Login credentials:");
    console.log(
      "┌──────────────┬─────────────────┬───────────────┬──────────────┐",
    );
    console.log(
      "│ Username     │ Full Name       │ NIK          │ Role         │",
    );
    console.log(
      "├──────────────┼─────────────────┼───────────────┼──────────────┤",
    );
    console.log(
      "│ admin        │ Administrator   │ -            │ admin        │",
    );
    console.log(
      "│ supervisor   │ User supervisor │ 5678         │ supervisor   │",
    );
    console.log(
      "│ sales        │ User Sales      │ 3456         │ sales        │",
    );
    console.log(
      "│ delivery     │ User Delivery   │ 2345         │ delivery     │",
    );
    console.log(
      "│ preparation  │ User preparation│ 1234         │ preparation  │",
    );
    console.log(
      "│ supervisor1  │ Supervisor 1    │ 3214567      │ supervisor   │",
    );
    console.log(
      "│ user1        │ User 1          │ 12345        │ user         │",
    );
    console.log(
      "└──────────────┴─────────────────┴───────────────┴──────────────┘",
    );
    console.log("\nAll passwords: password123 (except admin: admin)");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

seed();
