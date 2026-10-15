import "dotenv/config";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
async function main() {
const source = new URL(process.env.DATABASE_URL ?? "");
if (!["127.0.0.1", "localhost"].includes(source.hostname) || source.pathname !== "/fallsfix_dev") throw new Error("This restore drill is restricted to the local fallsfix_dev database.");
const bin = process.env.POSTGRES_BIN ?? "C:/Program Files/PostgreSQL/18/bin";
const suffix = process.platform === "win32" ? ".exe" : "";
const backupDir = path.resolve(".local/backups"); mkdirSync(backupDir, {recursive:true});
const name = `fallsfix_restore_${Date.now()}`;
const archive = path.join(backupDir,`${name}.dump`);
const env = {...process.env, PGHOST: source.hostname, PGPORT:source.port, PGUSER:decodeURIComponent(source.username), PGPASSWORD:decodeURIComponent(source.password), PGDATABASE:source.pathname.slice(1)};
const run = (command:string,args:string[], variables=env) => execFileSync(path.join(bin,command+suffix),args,{env:variables,stdio:["ignore","pipe","pipe"],windowsHide:true});
const admin = new pg.Client({host:source.hostname,port:Number(source.port),user:"fallsfix_bootstrap",password:readFileSync(".local/bootstrap-password.txt","utf8").trim(),database:"postgres"});
const original = new pg.Client({connectionString:source.href});
let restored:pg.Client|undefined;
let created=false;
try {
  run("pg_dump",["--format=custom","--no-owner","--no-acl","--file",archive]);
  await admin.connect(); await original.connect();
  if(!/^fallsfix_restore_\d+$/.test(name)) throw new Error("Unsafe restore target.");
  await admin.query(`CREATE DATABASE "${name}" OWNER "fallsfix_dev"`); created=true;
  run("pg_restore",["--no-owner","--no-acl","--exit-on-error","--dbname",name,archive],{...env,PGDATABASE:name});
  restored=new pg.Client({host:source.hostname,port:Number(source.port),user:decodeURIComponent(source.username),password:decodeURIComponent(source.password),database:name});await restored.connect();
  const tables=["User","Job","JobDocument","Payment","JobRefund","JobPhoto","AuditEvent","ServiceCategory","_prisma_migrations"];
  for(const table of tables) {
    const count=`SELECT count(*)::text AS count FROM "${table}"`;
    if((await original.query(count)).rows[0].count !== (await restored.query(count)).rows[0].count) throw new Error(`Restore mismatch: ${table}`);
  }
  console.log("Local backup and isolated restore succeeded; row counts matched for all checked tables.");
  console.log(`Private archive retained at ${archive}`);
} finally {
  await restored?.end(); await original.end();
  if(created) await admin.query(`DROP DATABASE "${name}"`);
  await admin.end();
}

}
main().catch(error => { console.error(error instanceof Error ? error.message : "Operation failed."); process.exitCode = 1; });
