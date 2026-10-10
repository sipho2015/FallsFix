import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import sharp from "sharp";
import type { Prisma, Role } from "../generated/prisma/client";
import { createDatabaseClient } from "../src/backend/database/create-client";
import { getTestDatabaseUrl } from "../src/backend/database/test-config";
import { executeOperation, OperationError } from "../src/backend/operations/service";
import { normalizePhoto } from "../src/backend/operations/photos";
import { seedReferenceData } from "../prisma/seed-data";
import { readAuthorizedJob } from "../src/backend/authorization/policy";
import { failureRefund, invoiceBalance, labourSplit } from "../src/shared/validation/commercial";
import { deleteEligibleJobPhotos } from "../src/backend/operations/retention";
const db = createDatabaseClient(getTestDatabaseUrl()); after(()=>db.$disconnect());
async function fixture(tx: Prisma.TransactionClient) {
  await seedReferenceData(tx);
  const make = (role:Role) => tx.user.create({data:{name:`${role} fixture`,email:`${randomUUID()}@example.test`,emailVerified:true,roles:{create:{role}},...(role==="CUSTOMER"?{customerProfile:{create:{}}}:{})}});
  const customer=await make("CUSTOMER"), stranger=await make("CUSTOMER"), admin=await make("ADMIN"), technician=await make("CUSTOMER");
  const category=await tx.serviceCategory.findUniqueOrThrow({where:{slug:"electrical"}});
  await executeOperation(tx,admin.id,{action:"verifyTechnician",userId:technician.id,categoryId:category.id,identityType:"NATIONAL_ID",identityEvidence:"Private review fixture",phone:"+263123456789",profilePhotoEvidence:"Profile reviewed fixture",serviceArea:"victoria-falls",competenceEvidence:"Reference checked",reason:"Verified fixture qualifications"});
  await executeOperation(tx,admin.id,{action:"catalogue",categoryId:category.id,isActive:true,reason:"Fixture coverage ready"});
  await tx.businessSetting.upsert({where:{key:"requestIntake"},create:{key:"requestIntake",value:"open"},update:{value:"open"}});
  const request={action:"request",requestKey:randomUUID(),category:"electrical",description:"Please repair the broken kitchen socket.",addressLine:"10 Fixture Road",locality:"Victoria Falls",contactName:"Fixture Customer",contactPhone:"+263123456789"};
  const saved=await executeOperation(tx,customer.id,request); assert.ok(saved.jobId);
  const jobId=saved.jobId;
  const run=async(actor:string,action:string,extra:Record<string,unknown>={})=>{const j=await tx.job.findUniqueOrThrow({where:{id:jobId}});return executeOperation(tx,actor,{action,jobId,version:j.version,...extra});};
  return {customer,stranger,admin,technician,category,jobId,request,run};
}
async function rollback(check:(tx:Prisma.TransactionClient,f:Awaited<ReturnType<typeof fixture>>)=>Promise<void>) {
  const end=new Error("rollback operations fixture"); try{await db.$transaction(async tx=>{await check(tx,await fixture(tx));throw end;},{timeout:60000});}catch(e){if(e!==end)throw e;}
}
const rejected=(fn:()=>Promise<unknown>)=>assert.rejects(fn,OperationError);

async function pricedWork(tx: Prisma.TransactionClient, f: Awaited<ReturnType<typeof fixture>>, complete = true) {
  await f.run(f.admin.id,"reviewRequest");
  await f.run(f.admin.id,"assign",{technicianId:f.technician.id,reason:"Verified coverage"});
  await f.run(f.technician.id,"accept");
  await rejected(()=>f.run(f.admin.id,"schedule",{purpose:"ASSESSMENT",assessmentNoCharge:true,startsAt:new Date(Date.now()+3600000).toISOString(),endsAt:new Date(Date.now()+7200000).toISOString(),reason:"Cannot dispatch before approved call-out"}));
  await f.run(f.admin.id,"quote",{scope:"Labour, parts and individually priced travel; no other charges.",currency:"USD",lines:[
    {type:"LABOUR",description:"Labour",quantity:1,unitAmount:"40.00"},
    {type:"MATERIALS",description:"Parts",quantity:1,unitAmount:"50.00"},
    {type:"CALLOUT",description:"Travel priced for location and distance",quantity:1,unitAmount:"10.00"},
  ]});
  const quote=await tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,status:"SENT"}});
  assert.ok(Math.abs(+quote.expiresAt! - +quote.createdAt - 14*86400000) < 3000);
  await rejected(()=>f.run(f.technician.id,"progress",{status:"ON_THE_WAY",reason:"Not approved"}));
  await f.run(f.customer.id,"quoteDecision",{documentId:quote.id,approve:true});
  await f.run(f.admin.id,"schedule",{purpose:"ASSESSMENT",startsAt:new Date(Date.now()+3600000).toISOString(),endsAt:new Date(Date.now()+7200000).toISOString(),reason:"Approved call-out; customer and technician agreed"});
  for(const status of ["ON_THE_WAY","ARRIVED","IN_PROGRESS"]) await f.run(f.technician.id,"progress",{status,reason:"Travel and repair progress"});
  for(const [key,value] of [["invoiceIssuer","Fixture Services"],["invoiceAddress","10 Test Road"],["invoicePhone","+263123456789"],["invoiceTaxId",""]]) await executeOperation(tx,f.admin.id,{action:"setting",key,value,reason:"Fixture invoice settings"});
  if(complete) {
    await f.run(f.technician.id,"progress",{status:"AWAITING_CUSTOMER_CONFIRMATION",reason:"Repair tested and working"});
    await f.run(f.customer.id,"confirm");
    await f.run(f.admin.id,"invoice");
  } else await f.run(f.admin.id,"invoice",{failureSettlement:true,reason:"Technician unable to finish; customer agreed to settlement review"});
  return tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,kind:"INVOICE"}});
}

test("labour allocation excludes materials, travel and unclassified legacy lines",()=>{
  const split=labourSplit([{type:"LABOUR",description:"Labour",quantity:1,unitAmount:10001},{type:"MATERIALS",description:"Parts",quantity:1,unitAmount:90000},{type:"CALLOUT",description:"Travel",quantity:1,unitAmount:5000},{description:"Legacy unspecified",quantity:1,unitAmount:10000}]);
  assert.deepEqual(split,{labour:10001,technician:7501,fallsfix:2500,unclassified:true});
  assert.deepEqual(failureRefund(6000,1000,10000),{eligiblePaid:5000,amount:3250,creditAmount:7250});
});

test("technician approval requires independent identity, photo, phone and area evidence",()=>rollback(async(tx,f)=>{
  await rejected(()=>executeOperation(tx,f.admin.id,{action:"verifyTechnician",userId:f.stranger.id,categoryId:f.category.id,reason:"Problem photo alone"}));
  await rejected(()=>executeOperation(tx,f.admin.id,{action:"verifyTechnician",userId:f.stranger.id,categoryId:f.category.id,identityType:"PASSPORT",identityEvidence:"/api/photos/job-evidence",profilePhotoEvidence:"Private photo review",phone:"+263123456789",serviceArea:"victoria-falls",reason:"Invalid job photo evidence"}));
  assert.equal(await tx.technicianProfile.count({where:{userId:f.stranger.id}}),0);
  const verified=await tx.technicianProfile.findUniqueOrThrow({where:{userId:f.technician.id}});
  assert.equal((verified.verificationEvidence as {identityType:string}).identityType,"NATIONAL_ID");
}));

test("failed repair refunds use eligible receipts, preserve originals and settle separately",()=>rollback(async(tx,f)=>{
  const invoice=await pricedWork(tx,f,false);
  assert.equal((await tx.job.findUniqueOrThrow({where:{id:f.jobId}})).status,"CANCELLED");
  assert.equal((invoice.issuerSnapshot as Record<string,string>).invoiceTaxId,"");
  const payment={documentId:invoice.id,operationId:randomUUID(),amount:"60.00",currency:"USD",method:"ECOCASH",reference:"ACTUAL-DEPOSIT",receivedAt:new Date().toISOString()};
  await f.run(f.admin.id,"payment",payment);
  const refund={documentId:invoice.id,operationId:randomUUID(),excludedPaid:"10.00",excludedCosts:"Special part purchased with prior customer approval REF-01",reason:"Technician unable to complete. Customer agreed eligible receipt settlement."};
  await rejected(()=>f.run(f.customer.id,"approveRefund",refund));
  await rejected(()=>f.run(f.admin.id,"approveRefund",{...refund,excludedPaid:"70.00"}));
  await f.run(f.admin.id,"approveRefund",refund); await f.run(f.admin.id,"approveRefund",refund);
  const record=await tx.jobRefund.findUniqueOrThrow({where:{documentId:invoice.id}});
  assert.equal(record.eligiblePaid,5000); assert.equal(record.amount,3250); assert.equal(record.creditAmount,7250);
  await rejected(()=>f.run(f.admin.id,"close",{reason:"Refund still unpaid"}));
  const receipt=await tx.payment.findFirstOrThrow({where:{documentId:invoice.id}});
  await rejected(()=>f.run(f.admin.id,"reversePayment",{paymentId:receipt.id,reason:"Cannot erase the refund basis"}));
  const payout={refundId:record.id,method:"BANK_TRANSFER",reference:"REFUND-01",paidAt:new Date().toISOString()};
  await f.run(f.admin.id,"payRefund",payout); await f.run(f.admin.id,"payRefund",payout);
  await rejected(()=>f.run(f.admin.id,"payRefund",{...payout,reference:"DIFFERENT"}));
  const settled=await tx.jobDocument.findUniqueOrThrow({where:{id:invoice.id},include:{payments:true,refund:true}});
  assert.equal(settled.total,10000); assert.equal(settled.payments[0].amount,6000);
  assert.equal(invoiceBalance(settled).balance,0); assert.equal(invoiceBalance(settled).refunded,3250);
  await f.run(f.admin.id,"close",{reason:"Refund paid and settlement agreed"});
}));

test("completion notification starts rework; complaints, rework and holds protect evidence",()=>rollback(async(tx,f)=>{
  await pricedWork(tx,f);
  const job=await tx.job.findUniqueOrThrow({where:{id:f.jobId}});
  assert.ok(job.completedNotifiedAt && job.reworkUntil);
  assert.ok(Math.abs(+job.reworkUntil-+job.completedNotifiedAt-3*86400000)<100);
  assert.ok(await tx.notification.count({where:{jobId:f.jobId,message:{contains:"three-day"}}}));
  const past=new Date(Date.now()-5*86400000), later=new Date(+job.reworkUntil+1000);
  await tx.jobPhoto.create({data:{jobId:f.jobId,uploaderId:f.customer.id,bytes:new Uint8Array([1,2,3]),createdAt:past}});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,job.reworkUntil,true),0);
  await f.run(f.customer.id,"complaint",{body:"The same fault returned. Please provide free rework."});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,later,true),0);
  const complaint=await tx.complaint.findFirstOrThrow({where:{jobId:f.jobId}});
  await f.run(f.admin.id,"resolveComplaint",{complaintId:complaint.id,outcome:"REWORK",resolution:"Approved no-charge rework within original scope"});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,later,true),0);
  await f.run(f.admin.id,"finishRework",{reason:"Repair tested; customer agreed rework completed"});
  await f.run(f.admin.id,"retentionHold",{holdReason:"Fraud investigation evidence",reason:"Preserve required evidence"});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,later,true),0);
  await f.run(f.admin.id,"retentionHold",{holdReason:"",reason:"Investigation complete; release hold"});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,later,false),1);
  assert.equal(await tx.jobPhoto.count({where:{jobId:f.jobId}}),1);
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,later,true),1);
}));

test("pending refund protects photos after completion window and settings do not rewrite invoices",()=>rollback(async(tx,f)=>{
  const invoice=await pricedWork(tx,f);
  await executeOperation(tx,f.admin.id,{action:"setting",key:"invoiceIssuer",value:"Changed Business",reason:"Later settings update"});
  assert.equal(((await tx.jobDocument.findUniqueOrThrow({where:{id:invoice.id}})).issuerSnapshot as Record<string,string>).invoiceIssuer,"Fixture Services");
  await f.run(f.admin.id,"payment",{documentId:invoice.id,operationId:randomUUID(),amount:"100.00",currency:"USD",method:"VISA",reference:"CARD-MANUAL",receivedAt:new Date().toISOString()});
  await f.run(f.admin.id,"approveRefund",{documentId:invoice.id,operationId:randomUUID(),excludedPaid:"0.00",excludedCosts:"No approved non-refundable costs",reason:"Repair failed and technician cannot complete; customer agreed settlement"});
  await tx.jobPhoto.create({data:{jobId:f.jobId,uploaderId:f.customer.id,bytes:new Uint8Array([1]),createdAt:new Date(Date.now()-5*86400000)}});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,new Date(Date.now()+4*86400000),true),0);
  await tx.job.update({where:{id:f.jobId},data:{completedNotifiedAt:null,reworkUntil:null}});
  assert.equal(await deleteEligibleJobPhotos(tx,f.jobId,new Date(Date.now()+30*86400000),true),0);
}));

test("administrator role and suspension operations acquire the PostgreSQL lock",()=>rollback(async(tx,f)=>{
  await executeOperation(tx,f.admin.id,{action:"role",userId:f.stranger.id,role:"ADMIN",grant:true,reason:"Second administrator for test"});
  assert.ok(await tx.userRole.findUnique({where:{userId_role:{userId:f.stranger.id,role:"ADMIN"}}}));
  await executeOperation(tx,f.admin.id,{action:"suspend",userId:f.stranger.id,suspended:true,reason:"Suspend test account"});
  assert.equal((await tx.user.findUniqueOrThrow({where:{id:f.stranger.id}})).status,"SUSPENDED");
}));
test("request retries, ownership, profile snapshots and stale writes",()=>rollback(async(tx,f)=>{
  assert.equal((await executeOperation(tx,f.customer.id,f.request)).jobId,f.jobId);
  assert.equal(await tx.job.count({where:{requestKey:f.request.requestKey}}),1);
  await rejected(()=>executeOperation(tx,f.stranger.id,f.request));
  await rejected(()=>f.run(f.stranger.id,"cancel",{reason:"Not my request"}));
  await rejected(()=>f.run(f.customer.id,"reviewRequest"));
  await f.run(f.admin.id,"reviewRequest");
  await rejected(()=>executeOperation(tx,f.admin.id,{action:"assign",jobId:f.jobId,version:0,technicianId:f.technician.id,reason:"Stale action"}));
  await executeOperation(tx,f.customer.id,{action:"profile",name:"New profile name",phone:"+263987654321"});
  assert.equal((await tx.jobLocation.findUniqueOrThrow({where:{jobId:f.jobId}})).contactName,"Fixture Customer");
  assert.equal(await tx.jobStatusHistory.count({where:{jobId:f.jobId}}),2);
}));
test("complete customer to assignment, quote, work, invoice, payment, review and closure",()=>rollback(async(tx,f)=>{
  await f.run(f.admin.id,"reviewRequest");
  await f.run(f.admin.id,"assign",{technicianId:f.technician.id,reason:"Verified coverage"});
  await rejected(()=>f.run(f.stranger.id,"accept"));
  await f.run(f.technician.id,"accept");
  await f.run(f.technician.id,"progress",{status:"ASSESSING",reason:"Remote assessment completed"});
  await rejected(()=>f.run(f.technician.id,"progress",{status:"IN_PROGRESS",reason:"No approved quote"}));
  await f.run(f.admin.id,"quote",{scope:"Replace one socket, labour included. No additional fees or taxes.",currency:"USD",expiresAt:new Date(Date.now()+86400000).toISOString(),lines:[{type:"CALLOUT",description:"Agreed remote assessment; no travel charge",quantity:1,unitAmount:"0.00"},{type:"LABOUR",description:"Socket and installation",quantity:1,unitAmount:"25.10"},{type:"MATERIALS",description:"Materials",quantity:2,unitAmount:"0.20"}]});
  const quote=await tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,kind:"QUOTE",status:"SENT"}});
  assert.equal(quote.total,2550);
  await rejected(()=>f.run(f.admin.id,"quoteDecision",{documentId:quote.id,approve:true}));
  await f.run(f.customer.id,"quoteDecision",{documentId:quote.id,approve:true});
  await f.run(f.admin.id,"schedule",{purpose:"WORK",startsAt:new Date(Date.now()+3600000).toISOString(),endsAt:new Date(Date.now()+7200000).toISOString(),reason:"Customer and technician agreed"});
  for(const status of ["ON_THE_WAY","ARRIVED","IN_PROGRESS","AWAITING_CUSTOMER_CONFIRMATION"]) await f.run(f.technician.id,"progress",{status,reason:"Work completed and socket tested"});
  await f.run(f.customer.id,"complaint",{body:"Please check the final socket alignment."});
  await rejected(()=>f.run(f.customer.id,"confirm"));
  const complaint=await tx.complaint.findFirstOrThrow({where:{jobId:f.jobId}});
  await f.run(f.admin.id,"resolveComplaint",{complaintId:complaint.id,outcome:"RESOLVED",resolution:"Customer agreed the socket is correctly aligned."});
  await f.run(f.customer.id,"confirm");
  await rejected(()=>f.run(f.admin.id,"close",{reason:"Cannot close unpaid"}));
  for(const [key,value] of [["invoiceIssuer","Fixture Services"],["invoiceAddress","10 Test Road"]]) await executeOperation(tx,f.admin.id,{action:"setting",key,value,reason:"Fixture invoice settings"});
  await f.run(f.admin.id,"invoice");
  const invoice=await tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,kind:"INVOICE"}});
  const payment={documentId:invoice.id,operationId:randomUUID(),amount:"10.00",currency:"USD",method:"CASH",reference:"TEST-1",receivedAt:new Date().toISOString()};
  await rejected(()=>f.run(f.customer.id,"payment",payment));
  await f.run(f.admin.id,"payment",payment); await f.run(f.admin.id,"payment",payment);
  assert.equal(await tx.payment.count({where:{documentId:invoice.id}}),1);
  await rejected(()=>f.run(f.admin.id,"payment",{...payment,operationId:randomUUID(),amount:"20.00"}));
  const receipt=await tx.payment.findFirstOrThrow({where:{documentId:invoice.id}});
  await f.run(f.admin.id,"reversePayment",{paymentId:receipt.id,reason:"Incorrect manual receipt"});
  await f.run(f.admin.id,"payment",{...payment,operationId:randomUUID(),amount:"25.50"});
  await f.run(f.customer.id,"review",{rating:5,body:"A useful and professional service."});
  await rejected(()=>f.run(f.customer.id,"review",{rating:4,body:"Duplicate review should fail"}));
  await f.run(f.admin.id,"close",{reason:"Invoice settled, no open complaints"});
  assert.equal((await tx.job.findUniqueOrThrow({where:{id:f.jobId}})).status,"CLOSED");
  await rejected(()=>f.run(f.admin.id,"note",{body:"Cannot edit a closed job",visibility:"INTERNAL"}));
  assert.equal(await readAuthorizedJob(tx,f.technician.id,f.jobId),null);
  assert.ok(await tx.auditEvent.count({where:{targetId:f.jobId}})>10);
}));
test("decline and reassignment revoke technician access; expired quotes stay blocked",()=>rollback(async(tx,f)=>{
  await f.run(f.admin.id,"reviewRequest"); await f.run(f.admin.id,"assign",{technicianId:f.technician.id,reason:"Assign fixture"});
  await f.run(f.technician.id,"decline",{reason:"Unavailable for this request"});
  assert.equal(await readAuthorizedJob(tx,f.technician.id,f.jobId),null);
  await f.run(f.admin.id,"assign",{technicianId:f.technician.id,reason:"Available again"}); await f.run(f.technician.id,"accept");
  await f.run(f.technician.id,"progress",{status:"ASSESSING",reason:"Assessment completed"});
  await f.run(f.admin.id,"quote",{scope:"Defined replacement scope",currency:"USD",expiresAt:new Date(Date.now()+86400000).toISOString(),lines:[{type:"LABOUR",description:"Repair",quantity:1,unitAmount:"1.00"}]});
  const quote=await tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,status:"SENT"}});
  await tx.jobDocument.update({where:{id:quote.id},data:{expiresAt:new Date(Date.now()-1000)}});
  await rejected(()=>f.run(f.customer.id,"quoteDecision",{documentId:quote.id,approve:true}));
  await f.run(f.customer.id,"cancel",{reason:"No longer needed"});
  assert.equal(await tx.jobAssignment.count({where:{jobId:f.jobId,endedAt:null}}),0);
}));
test("photo decoding rejects SVG, corrupt input and oversized uploads; valid images are reencoded",async()=>{
  await rejected(()=>normalizePhoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')));
  await rejected(()=>normalizePhoto(Buffer.from("not an image")));
  await assert.rejects(()=>normalizePhoto(Buffer.alloc(4*1024*1024+1)), (error: unknown) => error instanceof OperationError && error.status === 413);
  const source=await sharp({create:{width:32,height:32,channels:3,background:"orange"}}).png().toBuffer();
  const result=await normalizePhoto(source);const metadata=await sharp(result).metadata();assert.equal(metadata.format,"webp");assert.equal(metadata.exif,undefined);
});

test("concurrent administrators cannot apply two transitions to the same version",async()=>{
  const f=await db.$transaction(tx=>fixture(tx),{timeout:30000});
  try {
    const input={action:"reviewRequest",jobId:f.jobId,version:0};
    const results=await Promise.allSettled([db.$transaction(tx=>executeOperation(tx,f.admin.id,input)),db.$transaction(tx=>executeOperation(tx,f.admin.id,input))]);
    assert.equal(results.filter(r=>r.status==="fulfilled").length,1);
    const failure=results.find(r=>r.status==="rejected");assert.ok(failure?.status==="rejected" && failure.reason instanceof OperationError && failure.reason.status===409);
    assert.equal(await db.jobStatusHistory.count({where:{jobId:f.jobId}}),2);
  } finally {
    const ids=[f.customer.id,f.stranger.id,f.admin.id,f.technician.id];
    await db.notification.deleteMany({where:{userId:{in:ids}}});
    await db.auditEvent.deleteMany({where:{actorId:{in:ids}}});
    await db.jobStatusHistory.deleteMany({where:{jobId:f.jobId}});
    await db.jobLocation.deleteMany({where:{jobId:f.jobId}});
    await db.job.delete({where:{id:f.jobId}});
    await db.technicianSkill.deleteMany({where:{technicianId:f.technician.id}});
    await db.technicianServiceArea.deleteMany({where:{technicianId:f.technician.id}});
    await db.technicianProfile.deleteMany({where:{userId:{in:ids}}});
    await db.customerProfile.deleteMany({where:{userId:{in:ids}}});
    await db.userRole.deleteMany({where:{userId:{in:ids}}});
    await db.user.deleteMany({where:{id:{in:ids}}});
  }
});

test("drafts stay editable, sent revisions stay immutable and rejection requires fresh approval",()=>rollback(async(tx,f)=>{
  await f.run(f.admin.id,"reviewRequest");await f.run(f.admin.id,"assign",{technicianId:f.technician.id,reason:"Verified coverage"});await f.run(f.technician.id,"accept");await f.run(f.technician.id,"progress",{status:"ASSESSING",reason:"Assessment complete"});
  const quote={scope:"Replace socket, no additional fees",currency:"USD",expiresAt:new Date(Date.now()+86400000).toISOString(),lines:[{type:"LABOUR",description:"Socket replacement",quantity:1,unitAmount:"20.00"}],send:false};
  await f.run(f.admin.id,"quote",quote);await f.run(f.admin.id,"quote",{...quote,lines:[{type:"LABOUR",description:"Socket replacement",quantity:1,unitAmount:"21.00"}]});
  assert.equal(await tx.jobDocument.count({where:{jobId:f.jobId}}),1);
  const draft=await tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,status:"DRAFT"}});assert.equal(draft.total,2100);
  await f.run(f.admin.id,"sendQuote",{documentId:draft.id});
  await f.run(f.customer.id,"quoteDecision",{documentId:draft.id,approve:false});
  assert.equal((await tx.job.findUniqueOrThrow({where:{id:f.jobId}})).status,"ASSESSING");
  await f.run(f.admin.id,"quote",{...quote,send:true});
  const revision=await tx.jobDocument.findFirstOrThrow({where:{jobId:f.jobId,status:"SENT"}});assert.equal(revision.revision,2);
  assert.equal((await tx.jobDocument.findUniqueOrThrow({where:{id:draft.id}})).total,2100);
  await rejected(()=>f.run(f.customer.id,"quoteDecision",{documentId:draft.id,approve:true}));
  await f.run(f.customer.id,"quoteDecision",{documentId:revision.id,approve:true});
}));
