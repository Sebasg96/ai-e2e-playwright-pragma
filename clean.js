const { Client } = require('pg');
require('dotenv').config();

async function clean() {
    // Determine the port (6543 pooler or 5432 direct)
    const url = process.env.DATABASE_URL;
    const client = new Client({ connectionString: url });
    
    await client.connect();
    console.log("Connected directly to Postgres!");
    
    const tenantId = process.env.TEST_TENANT_ID || 'f15dbbe9-806b-4601-b67a-f296d4fe4928';
    
    try {
    const queries = [
        { q: `DELETE FROM "StrategicAccess" WHERE "tenantId" = $1`, n: "StrategicAccess" },
        { q: `DELETE FROM "KanbanTask" WHERE "tenantId" = $1`, n: "KanbanTask" },
        { q: `DELETE FROM "Initiative" WHERE "tenantId" = $1`, n: "Initiative" },
        { q: `DELETE FROM "KeyResultUpdate" WHERE "keyResultId" IN (SELECT id FROM "KeyResult" WHERE "tenantId" = $1)`, n: "KeyResultUpdate" },
        { q: `DELETE FROM "KeyResult" WHERE "tenantId" = $1`, n: "KeyResult" },
        { q: `DELETE FROM "Objective" WHERE "tenantId" = $1`, n: "Objective" },
        { q: `DELETE FROM "Mega" WHERE "tenantId" = $1`, n: "Mega" },
        { q: `DELETE FROM "Purpose" WHERE "tenantId" = $1`, n: "Purpose" },
        { q: `DELETE FROM "StrategicAxis" WHERE "tenantId" = $1`, n: "StrategicAxis" },
        { q: `DELETE FROM "TeamMember" WHERE "teamId" IN (SELECT id FROM "Team" WHERE "tenantId" = $1)`, n: "TeamMember" },
        { q: `DELETE FROM "Team" WHERE "tenantId" = $1`, n: "Team" },
        { q: `DELETE FROM "Ritual" WHERE "tenantId" = $1`, n: "Ritual" },
        { q: `DELETE FROM "Document" WHERE "tenantId" = $1`, n: "Document" },
        { q: `DELETE FROM "AnalyticsSnapshot" WHERE "tenantId" = $1`, n: "AnalyticsSnapshot" },
        { q: `DELETE FROM "DistinctiveCapability" WHERE "tenantId" = $1`, n: "DistinctiveCapability" },
        { q: `DELETE FROM "EmergentInsight" WHERE "tenantId" = $1`, n: "EmergentInsight" },
        { q: `DELETE FROM "HardChoice" WHERE "tenantId" = $1`, n: "HardChoice" },
        { q: `DELETE FROM "MarketValueMetric" WHERE "tenantId" = $1`, n: "MarketValueMetric" },
        { q: `DELETE FROM "MutationLog" WHERE "tenantId" = $1`, n: "MutationLog" },
        { q: `DELETE FROM "OrganizationalValue" WHERE "tenantId" = $1`, n: "OrganizationalValue" },
        { q: `DELETE FROM "StrategicConversation" WHERE "tenantId" = $1`, n: "StrategicConversation" },
        { q: `DELETE FROM "StrategicGoal" WHERE "tenantId" = $1`, n: "StrategicGoal" }
    ];

    console.log("--- Iniciando eliminación secuencial ---");
    for (const { q, n } of queries) {
        try {
            await client.query(q, [tenantId]);
            console.log("Deleted " + n);
        } catch (e) {
            console.log("Skipped " + n + ": " + e.message);
        }
    }
    console.log("✅ Limpieza completada con éxito.");
    } finally {
        await client.end();
        console.log("Done.");
    }
}
clean();
