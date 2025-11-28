info: Microsoft.EntityFrameworkCore.Database.Command[20101]
ocsp-api | Executed DbCommand (1ms) [Parameters=[@__dto_ProjectId_0='?' (DbType = Guid), @__searchDate_1='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
ocsp-api | SELECT c."Id", c."CleanlinessRating", c."ConstructionTeam", c."ContractorName", c."CreatedAt", c."CreatedBy", c."DiaryDate", c."IncidentReport", c."Notes", c."ProgressRating", c."ProjectId", c."QualityRating", c."Recommendations", c."SafetyRating", c."SupervisorName", c."SupervisorPosition", c."SupervisorUnitName", c."UpdatedAt", c."UpdatedBy"
ocsp-api | FROM "ConstructionDiaries" AS c
ocsp-api | WHERE c."ProjectId" = @**dto_ProjectId_0 AND date_trunc('day', c."DiaryDate", 'UTC') = @**searchDate_1
ocsp-api | LIMIT 1
ocsp-api | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
ocsp-api | Executed DbCommand (2ms) [Parameters=[@__get_Item_0='?' (DbType = Guid)], CommandType='Text', CommandTimeout='30']
ocsp-api | SELECT m."Id", m."ActualAmount", m."ActualQuantity", m."Code", m."ContractAmount", m."ContractQuantity", m."CreatedAt", m."CreatedBy", m."Description", m."EstimatedAmount", m."EstimatedQuantity", m."MaterialRequestId", m."Name", m."Notes", m."ProjectId", m."SortOrder", m."Supplier", m."Unit", m."UnitPrice", m."UpdatedAt", m."UpdatedBy", m."WorkItemId"
ocsp-api | FROM "Materials" AS m
ocsp-api | WHERE m."Id" = @**get_Item_0
ocsp-api | LIMIT 1
ocsp-api | [SaveChangesAsync] Found 6 AuditableEntity entries
ocsp-api | [SaveChangesAsync] Processing ConstructionDiary, State: Added
ocsp-api | [SaveChangesAsync] Final values - CreatedAt: 11/28/2025 17:21:20, UpdatedAt: 11/28/2025 17:21:20
ocsp-api | [SaveChangesAsync] Processing DiaryMaterialEntry, State: Added
ocsp-api | [SaveChangesAsync] Final values - CreatedAt: 11/28/2025 17:21:20, UpdatedAt: 11/28/2025 17:21:20
ocsp-api | [SaveChangesAsync] Processing DiaryWeatherPeriod, State: Added
ocsp-api | [SaveChangesAsync] Final values - CreatedAt: 11/28/2025 17:21:20, UpdatedAt: 11/28/2025 17:21:20
ocsp-api | [SaveChangesAsync] Processing DiaryWeatherPeriod, State: Added
ocsp-api | [SaveChangesAsync] Final values - CreatedAt: 11/28/2025 17:21:20, UpdatedAt: 11/28/2025 17:21:20
ocsp-api | [SaveChangesAsync] Processing DiaryWeatherPeriod, State: Added
ocsp-api | [SaveChangesAsync] Final values - CreatedAt: 11/28/2025 17:21:20, UpdatedAt: 11/28/2025 17:21:20
ocsp-api | [SaveChangesAsync] Processing DiaryWeatherPeriod, State: Added
ocsp-api | [SaveChangesAsync] Final values - CreatedAt: 11/28/2025 17:21:20, UpdatedAt: 11/28/2025 17:21:20
ocsp-api | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
ocsp-api | Failed executing DbCommand (22ms) [Parameters=[@p0='?' (DbType = Guid), @p1='?' (DbType = Int32), @p2='?', @p3='?', @p4='?' (DbType = DateTime), @p5='?', @p6='?' (DbType = DateTime), @p7='?', @p8='?', @p9='?' (DbType = Int32), @p10='?' (DbType = Guid), @p11='?' (DbType = Int32), @p12='?', @p13='?' (DbType = Int32), @p14='?', @p15='?', @p16='?', @p17='?' (DbType = DateTime), @p18='?', @p19='?' (DbType = Guid), @p20='?' (DbType = Decimal), @p21='?', @p22='?' (DbType = Guid), @p23='?' (DbType = Decimal), @p24='?' (DbType = DateTime), @p25='?', @p26='?' (DbType = Guid), @p27='?', @p28='?', @p29='?' (DbType = DateTime), @p30='?', @p31='?' (DbType = Decimal), @p32='?' (DbType = Guid), @p33='?', @p34='?' (DbType = Guid), @p35='?' (DbType = DateTime), @p36='?', @p37='?', @p38='?', @p39='?' (DbType = DateTime), @p40='?', @p41='?' (DbType = Guid), @p42='?', @p43='?' (DbType = Guid), @p44='?' (DbType = DateTime), @p45='?', @p46='?', @p47='?', @p48='?' (DbType = DateTime), @p49='?', @p50='?' (DbType = Guid), @p51='?', @p52='?' (DbType = Guid), @p53='?' (DbType = DateTime), @p54='?', @p55='?', @p56='?', @p57='?' (DbType = DateTime), @p58='?', @p59='?' (DbType = Guid), @p60='?', @p61='?' (DbType = Guid), @p62='?' (DbType = DateTime), @p63='?', @p64='?', @p65='?', @p66='?' (DbType = DateTime), @p67='?'], CommandType='Text', CommandTimeout='30']  
ocsp-api | INSERT INTO "ConstructionDiaries" ("Id", "CleanlinessRating", "ConstructionTeam", "ContractorName", "CreatedAt", "CreatedBy", "DiaryDate", "IncidentReport", "Notes", "ProgressRating", "ProjectId", "QualityRating", "Recommendations", "SafetyRating", "SupervisorName", "SupervisorPosition", "SupervisorUnitName", "UpdatedAt", "UpdatedBy")
ocsp-api | VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16, @p17, @p18);
ocsp-api | INSERT INTO "DiaryMaterialEntries" ("Id", "ActualQuantity", "Code", "ConstructionDiaryId", "ContractQuantity", "CreatedAt", "CreatedBy", "MaterialId", "MaterialName", "Unit", "UpdatedAt", "UpdatedBy", "Variance")
ocsp-api | VALUES (@p19, @p20, @p21, @p22, @p23, @p24, @p25, @p26, @p27, @p28, @p29, @p30, @p31);
ocsp-api | INSERT INTO "DiaryWeatherPeriods" ("Id", "Condition", "ConstructionDiaryId", "CreatedAt", "CreatedBy", "Period", "Temperature", "UpdatedAt", "UpdatedBy")
ocsp-api | VALUES (@p32, @p33, @p34, @p35, @p36, @p37, @p38, @p39, @p40);
ocsp-api | INSERT INTO "DiaryWeatherPeriods" ("Id", "Condition", "ConstructionDiaryId", "CreatedAt", "CreatedBy", "Period", "Temperature", "UpdatedAt", "UpdatedBy")
ocsp-api | VALUES (@p41, @p42, @p43, @p44, @p45, @p46, @p47, @p48, @p49);
ocsp-api | INSERT INTO "DiaryWeatherPeriods" ("Id", "Condition", "ConstructionDiaryId", "CreatedAt", "CreatedBy", "Period", "Temperature", "UpdatedAt", "UpdatedBy")
ocsp-api | VALUES (@p50, @p51, @p52, @p53, @p54, @p55, @p56, @p57, @p58);
ocsp-api | INSERT INTO "DiaryWeatherPeriods" ("Id", "Condition", "ConstructionDiaryId", "CreatedAt", "CreatedBy", "Period", "Temperature", "UpdatedAt", "UpdatedBy")
ocsp-api | VALUES (@p59, @p60, @p61, @p62, @p63, @p64, @p65, @p66, @p67);
ocsp-api | fail: Microsoft.EntityFrameworkCore.Update[10000]
ocsp-api | An exception occurred in the database while saving changes for context type 'OCSP.Infrastructure.Data.ApplicationDbContext'.
ocsp-api | Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.
ocsp-api | ---> Npgsql.PostgresException (0x80004005): 42P01: relation "DiaryMaterialEntries" does not exist
ocsp-api |
ocsp-api | POSITION: 13
ocsp-api | at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)  
ocsp-api | at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)  
ocsp-api | at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | Exception data:
ocsp-api | Severity: ERROR
ocsp-api | SqlState: 42P01
ocsp-api | MessageText: relation "DiaryMaterialEntries" does not exist
ocsp-api | Position: 13
ocsp-api | File: parse_relation.c
ocsp-api | Line: 1449
ocsp-api | Routine: parserOpenTable
ocsp-api | --- End of inner exception stack trace ---
ocsp-api | at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api  |          at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api  |          at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(IList`1 entriesToSave, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(StateManager stateManager, Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.DbContext.SaveChangesAsync(Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.
ocsp-api | ---> Npgsql.PostgresException (0x80004005): 42P01: relation "DiaryMaterialEntries" does not exist
ocsp-api |  
ocsp-api | POSITION: 13
ocsp-api | at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)  
ocsp-api | at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)  
ocsp-api | at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | Exception data:
ocsp-api | Severity: ERROR
ocsp-api | SqlState: 42P01
ocsp-api | MessageText: relation "DiaryMaterialEntries" does not exist
ocsp-api | Position: 13
ocsp-api | File: parse_relation.c
ocsp-api | Line: 1449
ocsp-api | Routine: parserOpenTable
ocsp-api | --- End of inner exception stack trace ---
ocsp-api | at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api  |          at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api  |          at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(IList`1 entriesToSave, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(StateManager stateManager, Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.DbContext.SaveChangesAsync(Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | fail: OCSP.API.Controllers.ConstructionDiaryController[0]
ocsp-api | Error creating diary
ocsp-api | Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.
ocsp-api | ---> Npgsql.PostgresException (0x80004005): 42P01: relation "DiaryMaterialEntries" does not exist
ocsp-api |
ocsp-api | POSITION: 13
ocsp-api | at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)  
ocsp-api | at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)  
ocsp-api | at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | Exception data:
ocsp-api | Severity: ERROR
ocsp-api | SqlState: 42P01
ocsp-api | MessageText: relation "DiaryMaterialEntries" does not exist
ocsp-api | Position: 13
ocsp-api | File: parse_relation.c
ocsp-api | Line: 1449
ocsp-api | Routine: parserOpenTable
ocsp-api | --- End of inner exception stack trace ---
ocsp-api | at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api  |          at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
ocsp-api  |          at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(IList`1 entriesToSave, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(StateManager stateManager, Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.DbContext.SaveChangesAsync(Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | at Microsoft.EntityFrameworkCore.DbContext.SaveChangesAsync(Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
ocsp-api | at OCSP.Infrastructure.Data.ApplicationDbContext.SaveChangesAsync(CancellationToken cancellationToken) in /src/src/OCSP.Infrastructure/Data/ApplicationDbContext.cs:line 992  
ocsp-api | at OCSP.Application.Services.ConstructionDiaryService.CreateDiaryAsync(CreateConstructionDiaryDto dto, Guid userId, CancellationToken ct) in /src/src/OCSP.Application/Services/ConstructionDiaryService.cs:line 222
ocsp-api | at OCSP.API.Controllers.ConstructionDiaryController.CreateDiary(CreateConstructionDiaryDto dto, CancellationToken ct) in /src/src/OCSP.API/Controllers/ConstructionDiaryController.cs:line 142
ocsp-api | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
ocsp-api | Executed DbCommand (2ms) [Parameters=[@**userId_0='?' (DbType = Guid), @**p_1='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
ocsp-api | SELECT t."Id", t."ActionUrl", t."CreatedAt", t."CreatedBy", t."IsRead", t."Message", t."NotificationDate", t."ProjectId", t."ReferenceId", t."Title", t."Type", t."UpdatedAt", t."UpdatedBy", t."UserId", p."Id", p."ActualBudget", p."Address", p."Budget", p."ContractorId", p."CreatedAt", p."CreatedBy", p."DelegateApprovalToSupervisor", p."Description", p."EndDate", p."EstimatedCompletionDate", p."FloorArea", p."HomeownerId", p."Name", p."NumberOfFloors", p."StartDate", p."Status", p."SupervisorId", p."SupervisorPackagePaymentStatus", p."UpdatedAt", p."UpdatedBy"  
ocsp-api | FROM (
ocsp-api | SELECT n."Id", n."ActionUrl", n."CreatedAt", n."CreatedBy", n."IsRead", n."Message", n."NotificationDate", n."ProjectId", n."ReferenceId", n."Title", n."Type", n."UpdatedAt", n."UpdatedBy", n."UserId"
ocsp-api | FROM "Notifications" AS n
ocsp-api | WHERE n."UserId" = @**userId_0
ocsp-api | ORDER BY n."NotificationDate" DESC
ocsp-api | LIMIT @**p_1
ocsp-api | ) AS t
ocsp-api | LEFT JOIN "Projects" AS p ON t."ProjectId" = p."Id"
ocsp-api | ORDER BY t."NotificationDate" DESC
ocsp-api | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
ocsp-api | Executed DbCommand (2ms) [Parameters=[@**userId_0='?' (DbType = Guid), @**p_1='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
ocsp-api | SELECT t."Id", t."ActionUrl", t."CreatedAt", t."CreatedBy", t."IsRead", t."Message", t."NotificationDate", t."ProjectId", t."ReferenceId", t."Title", t."Type", t."UpdatedAt", t."UpdatedBy", t."UserId", p."Id", p."ActualBudget", p."Address", p."Budget", p."ContractorId", p."CreatedAt", p."CreatedBy", p."DelegateApprovalToSupervisor", p."Description", p."EndDate", p."EstimatedCompletionDate", p."FloorArea", p."HomeownerId", p."Name", p."NumberOfFloors", p."StartDate", p."Status", p."SupervisorId", p."SupervisorPackagePaymentStatus", p."UpdatedAt", p."UpdatedBy"  
ocsp-api | FROM (
ocsp-api | SELECT n."Id", n."ActionUrl", n."CreatedAt", n."CreatedBy", n."IsRead", n."Message", n."NotificationDate", n."ProjectId", n."ReferenceId", n."Title", n."Type", n."UpdatedAt", n."UpdatedBy", n."UserId"
ocsp-api | FROM "Notifications" AS n
ocsp-api | WHERE n."UserId" = @**userId_0
ocsp-api | ORDER BY n."NotificationDate" DESC
ocsp-api | LIMIT @\_\_p_1
ocsp-api | ) AS t
ocsp-api | LEFT JOIN "Projects" AS p ON t."ProjectId" = p."Id"
ocsp-api | ORDER BY t."NotificationDate" DESC

Internal server error
registration.api.ts:84
GET http://localhost:8080/api/registration-request 500 (Internal Server Error)

POST http://localhost:8080/api/constructiondiary 500 (Internal Server Error)
client.ts:48 ❌ API Error: 500 /constructiondiary
page.tsx:172 Error saving diary:
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
