import "dotenv/config";
import { createDatabaseClient } from "../src/backend/database/create-client";
async function main() {
const email=process.argv[2]?.trim().toLowerCase();
if(!email) throw new Error("Usage: npm run admin:bootstrap -- verified-owner@example.com");
const db=createDatabaseClient(process.env.DATABASE_URL!);
try {
  await db.$transaction(async tx=>{
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(721032945)::text`;
    if(await tx.userRole.count({where:{role:"ADMIN"}})) throw new Error("An administrator already exists. Use audited role management instead.");
    const user=await tx.user.findUnique({where:{email}});
    if(!user?.emailVerified || user.status!=="ACTIVE") throw new Error("Register and verify the intended owner account first.");
    await tx.userRole.create({data:{userId:user.id,role:"ADMIN"}});
    await tx.auditEvent.create({data:{actorId:user.id,action:"bootstrapAdmin",targetId:user.id,detail:"First administrator provisioned through the operator CLI."}});
  });
  console.log("First administrator provisioned. Log in and open the administrator workspace.");
} finally {await db.$disconnect();}

}
main().catch(error => { console.error(error instanceof Error ? error.message : "Operation failed."); process.exitCode = 1; });
