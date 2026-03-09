import { dbPengamanan } from "./lib/db-pengamanan";
import {
  users,
  petugasJaga,
  posJaga,
  qrCodes,
  pengumuman,
} from "./lib/schema-pengamanan";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Seeding pengamanan database...\n");

    // ============================================================================
    // SEED USERS
    // ============================================================================
    console.log("📝 Seeding users...");

    const superadminUserId = crypto.randomUUID();

    const usersToSeed = [
      {
        id: superadminUserId,
        username: "superadmin",
        passwordHash: await Bun.password.hash("admin123"),
        role: "superadmin" as const,
      },
      {
        id: crypto.randomUUID(),
        username: "admin",
        passwordHash: await Bun.password.hash("admin123"),
        role: "admin" as const,
      },
    ];

    for (const user of usersToSeed) {
      const existingUser = await dbPengamanan
        .select()
        .from(users)
        .where(eq(users.username, user.username))
        .limit(1);

      if (existingUser.length === 0) {
        await dbPengamanan.insert(users).values(user);
        console.log(`  ✓ User created: ${user.username} (${user.role})`);
      } else {
        console.log(`  − User already exists: ${user.username}`);
      }
    }

    // ============================================================================
    // SEED PETUGAS JAGA
    // ============================================================================
    console.log("\n📝 Seeding petugas jaga...");

    const petugasToSeed = [
      { nama: "Bpk. Joko", nik: "1234567890123456", noHp: "081234567890" },
      { nama: "Bpk. Ahmad", nik: "1234567890123457", noHp: "081234567891" },
      { nama: "Bpk. Budi", nik: "1234567890123458", noHp: "081234567892" },
      { nama: "Ibu Siti", nik: "1234567890123459", noHp: "081234567893" },
      { nama: "Bpk. Agus", nik: "1234567890123460", noHp: "081234567894" },
    ];

    const petugasIds: string[] = [];
    for (const petugas of petugasToSeed) {
      const existingPetugas = await dbPengamanan
        .select()
        .from(petugasJaga)
        .where(eq(petugasJaga.nama, petugas.nama))
        .limit(1);

      let petugasId: string;
      if (existingPetugas.length === 0) {
        const newPetugas = await dbPengamanan
          .insert(petugasJaga)
          .values({
            ...petugas,
            createdBy: superadminUserId,
            updatedBy: superadminUserId,
          })
          .returning();
        petugasId = newPetugas[0].id;
        console.log(`  ✓ Petugas created: ${petugas.nama}`);
      } else {
        petugasId = existingPetugas[0].id;
        console.log(`  − Petugas already exists: ${petugas.nama}`);
      }
      petugasIds.push(petugasId);
    }

    // ============================================================================
    // SEED POS JAGA
    // ============================================================================
    console.log("\n📝 Seeding pos jaga...");

    const posToSeed = [
      { nama: "Pos 1 Utama", lokasi: "Gerbang Utama" },
      { nama: "Pos 2 Belakang", lokasi: "Gerbang Belakang" },
      { nama: "Pos 3 Darurat", lokasi: "Pintu Darurat" },
    ];

    const posIds: string[] = [];
    for (const pos of posToSeed) {
      const existingPos = await dbPengamanan
        .select()
        .from(posJaga)
        .where(eq(posJaga.nama, pos.nama))
        .limit(1);

      let posId: string;
      if (existingPos.length === 0) {
        const newPos = await dbPengamanan
          .insert(posJaga)
          .values({
            ...pos,
            createdBy: superadminUserId,
            updatedBy: superadminUserId,
          })
          .returning();
        posId = newPos[0].id;
        console.log(`  ✓ Pos created: ${pos.nama}`);
      } else {
        posId = existingPos[0].id;
        console.log(`  − Pos already exists: ${pos.nama}`);
      }
      posIds.push(posId);
    }

    // ============================================================================
    // SEED QR CODES
    // ============================================================================
    console.log("\n📝 Seeding QR codes...");

    const qrToSeed = [
      { nama: "Block A-101", penanggungJawab: "Bpk. Ahmad" },
      { nama: "Block A-102", penanggungJawab: "Ibu Sari" },
      { nama: "Block A-103", penanggungJawab: "Bpk. Budi" },
      { nama: "Block B-201", penanggungJawab: "Ibu Dewi" },
      { nama: "Block B-202", penanggungJawab: "Bpk. Joko" },
      { nama: "Block B-203", penanggungJawab: "Ibu Rina" },
      { nama: "Block C-301", penanggungJawab: "Bpk. Agus" },
      { nama: "Block C-302", penanggungJawab: "Ibu Maya" },
      { nama: "Block C-303", penanggungJawab: "Bpk. Dedi" },
      { nama: "Block D-401", penanggungJawab: "Ibu Lestari" },
      { nama: "Block D-402", penanggungJawab: "Bpk. Rudi" },
      { nama: "Block D-403", penanggungJawab: "Ibu Wati" },
      { nama: "Block E-501", penanggungJawab: "Bpk. Hendra" },
      { nama: "Block E-502", penanggungJawab: "Ibu Ani" },
      { nama: "Block E-503", penanggungJawab: "Bpk. Yanto" },
    ];

    // Lebaran 2026 dates (assuming around March 2026)
    const validFrom = new Date("2026-03-10");
    const validUntil = new Date("2026-04-10");

    for (const qr of qrToSeed) {
      const existingQr = await dbPengamanan
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.nama, qr.nama))
        .limit(1);

      if (existingQr.length === 0) {
        const qrCode = crypto.randomUUID();
        await dbPengamanan
          .insert(qrCodes)
          .values({
            qrCode,
            nama: qr.nama,
            penanggungJawab: qr.penanggungJawab,
            validFrom,
            validUntil,
            createdBy: superadminUserId,
            updatedBy: superadminUserId,
          });
        console.log(`  ✓ QR created: ${qr.nama} (QR: ${qrCode.slice(0, 8)}...)`);
      } else {
        console.log(`  − QR already exists: ${qr.nama}`);
      }
    }

    // ============================================================================
    // SEED PENGUMUMAN
    // ============================================================================
    console.log("\n📝 Seeding pengumuman...");

    const pengumumanToSeed = [
      {
        title: "Selamat Menjalankan Ibadah Puasa",
        content:
          "Selamat menjalankan ibadah puasa Ramadhan 1447 H. Mohon tetap menjaga kondisi fisik dan kesehatan saat bertugas.",
        priority: "normal" as const,
      },
      {
        title: "Jam Malam Dimulai Pukul 22:00",
        content:
          "Diberitahukan bahwa jam malam akan dimulai pukul 22:00. Petugas diharapkan lebih waspada terhadap aktivitas yang mencurigakan.",
        priority: "important" as const,
      },
      {
        title: "Ganti Jaga Petugas",
        content:
          "Ganti jaga petugas akan dilakukan setiap 6 jam. Pastikan serah terima jaga dilakukan dengan tertib.",
        priority: "normal" as const,
      },
    ];

    for (const pengumuman of pengumumanToSeed) {
      const existingPengumuman = await dbPengamanan
        .select()
        .from(pengumuman)
        .where(eq(pengumuman.title, pengumuman.title))
        .limit(1);

      if (existingPengumuman.length === 0) {
        await dbPengamanan.insert(pengumuman).values({
          ...pengumuman,
          createdBy: superadminUserId,
          updatedBy: superadminUserId,
        });
        console.log(`  ✓ Pengumuman created: ${pengumuman.title}`);
      } else {
        console.log(`  − Pengumuman already exists: ${pengumuman.title}`);
      }
    }

    // ============================================================================
    // DONE
    // ============================================================================
    console.log("\n✅ Seed data created successfully!\n");

    console.log("🔐 Login credentials:");
    console.log("┌──────────────┬──────────────┬─────────────┐");
    console.log("│ Username     │ Password     │ Role        │");
    console.log("├──────────────┼──────────────┼─────────────┤");
    console.log("│ superadmin   │ admin123     │ superadmin  │");
    console.log("│ admin        │ admin123     │ admin       │");
    console.log("└──────────────┴──────────────┴─────────────┘\n");

    console.log("👥 Petugas Jaga:");
    console.log("┌──────────────────┬───────────────────┬────────────────┐");
    console.log("│ Nama             │ NIK               │ No HP          │");
    console.log("├──────────────────┼───────────────────┼────────────────┤");
    console.log("│ Bpk. Joko        │ 1234567890123456  │ 081234567890   │");
    console.log("│ Bpk. Ahmad       │ 1234567890123457  │ 081234567891   │");
    console.log("│ Bpk. Budi        │ 1234567890123458  │ 081234567892   │");
    console.log("│ Ibu Siti         │ 1234567890123459  │ 081234567893   │");
    console.log("│ Bpk. Agus        │ 1234567890123460  │ 081234567894   │");
    console.log("└──────────────────┴───────────────────┴────────────────┘\n");

    console.log("📍 Pos Jaga:");
    console.log("┌──────────────────┬───────────────────┐");
    console.log("│ Nama             │ Lokasi            │");
    console.log("├──────────────────┼───────────────────┤");
    console.log("│ Pos 1 Utama      │ Gerbang Utama     │");
    console.log("│ Pos 2 Belakang   │ Gerbang Belakang  │");
    console.log("│ Pos 3 Darurat    │ Pintu Darurat     │");
    console.log("└──────────────────┴───────────────────┘\n");

    console.log(`📱 QR Codes: ${qrToSeed.length} blocks`);
    console.log("  Validity: 10 Maret 2026 - 10 April 2026\n");

    console.log("📢 Pengumuman:");
    console.log("┌─────────────────────────────────────┬─────────────┐");
    console.log("│ Title                                │ Priority    │");
    console.log("├─────────────────────────────────────┼─────────────┤");
    console.log("│ Selamat Menjalankan Ibadah Puasa    │ Normal      │");
    console.log("│ Jam Malam Dimulai Pukul 22:00       │ Important   │");
    console.log("│ Ganti Jaga Petugas                  │ Normal      │");
    console.log("└─────────────────────────────────────┴─────────────┘\n");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
