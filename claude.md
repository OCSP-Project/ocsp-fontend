xecuted DbCommand (3ms) [Parameters=[@__requestId_0='?' (DbType = Guid)], CommandType='Text', CommandTimeout='30']
ocsp-api | SELECT t."Id", t."ApprovedByHomeowner", t."ApprovedByHomeownerAt", t."ApprovedByHomeownerId", t."ApprovedBySupervisor", t."ApprovedBySupervisorAt", t."ApprovedBySupervisorId", t."ContractorId", t."CreatedAt", t."CreatedBy", t."FileName", t."FileUrl", t."Notes", t."ProjectId", t."RejectedAt", t."RejectedById", t."RejectionReason", t."RequestDate", t."Status", t."UpdatedAt", t."UpdatedBy", m0."Id", m0."ActualAmount", m0."ActualQuantity", m0."Code", m0."ContractAmount", m0."ContractQuantity", m0."CreatedAt", m0."CreatedBy", m0."Description", m0."EstimatedAmount", m0."EstimatedQuantity", m0."MaterialRequestId", m0."Name", m0."Notes", m0."ProjectId", m0."SortOrder", m0."Supplier", m0."Unit", m0."UnitPrice", m0."UpdatedAt", m0."UpdatedBy", m0."WorkItemId", m1."Id", m1."Action", m1."ActionDate", m1."ApprovedById", m1."ApproverRole", m1."Comments", m1."CreatedAt", m1."CreatedBy", m1."MaterialRequestId", m1."UpdatedAt", m1."UpdatedBy"
ocsp-api | FROM (
ocsp-api | SELECT m."Id", m."ApprovedByHomeowner", m."ApprovedByHomeownerAt", m."ApprovedByHomeownerId", m."ApprovedBySupervisor", m."ApprovedBySupervisorAt", m."ApprovedBySupervisorId", m."ContractorId", m."CreatedAt", m."CreatedBy", m."FileName", m."FileUrl", m."Notes", m."ProjectId", m."RejectedAt", m."RejectedById", m."RejectionReason", m."RequestDate", m."Status", m."UpdatedAt", m."UpdatedBy"
ocsp-api | FROM "MaterialRequests" AS m
ocsp-api | WHERE m."Id" = @\_\_requestId_0
ocsp-api | LIMIT 1
ocsp-api | ) AS t
ocsp-api | LEFT JOIN "Materials" AS m0 ON t."Id" = m0."MaterialRequestId"
ocsp-api | LEFT JOIN "MaterialApprovalHistories" AS m1 ON t."Id" = m1."MaterialRequestId"
ocsp-api | ORDER BY t."Id", m0."Id"
