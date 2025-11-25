"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createProjectsOverviewRouter;
// server/ProjectsOverview-server.ts
const express_1 = require("express");
function createProjectsOverviewRouter(pool) {
    const router = (0, express_1.Router)();
    //#region GET /api/projects/overview --------------------------------------
    router.get("/overview", async (req, res) => {
        const client = await pool.connect();
        try {
            const { project_name = "", client_name = "", status = "" } = req.query;
            const conds = [];
            const params = [];
            let idx = 1;
            if (project_name) {
                conds.push(`p.project_name ILIKE $${idx++}`);
                params.push(`%${project_name}%`);
            }
            if (client_name) {
                conds.push(`p.client_name ILIKE $${idx++}`);
                params.push(`%${client_name}%`);
            }
            if (status) {
                conds.push(`p.status = $${idx++}`);
                params.push(status);
            }
            const whereSql = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
            const sql = `
        WITH assign AS (
          SELECT
            p.project_no,
            up.part_type,
            pa.name AS part_name,
            pa.code AS part_code,
            dh.dong,
            dh.ho
          FROM jeongho_projects p
          LEFT JOIN jeongho_projects_dongho dh ON dh.project_no = p.project_no
          LEFT JOIN jeongho_projects_dongho_using_parts up ON up.dongho_id = dh.id
          LEFT JOIN jeongho_parts pa ON pa.code = up.part_code
        )
        SELECT
          p.project_no,
          p.project_name,
          p.client_name,
          p.site_name,
          p.contract_date,
          p.start_date,
          p.end_date,
          p.status,
          COALESCE(
            JSONB_AGG(
              JSONB_BUILD_OBJECT(
                'part_type', a.part_type,
                'part_name', a.part_name,
                'part_code', a.part_code,
                'dong', a.dong,
                'ho', a.ho
              )
            ) FILTER (WHERE a.part_code IS NOT NULL),
            '[]'::JSONB
          ) AS assigned_parts,
          COUNT(*) FILTER (WHERE a.part_type = '케이지')    AS cnt_cage,
          COUNT(*) FILTER (WHERE a.part_type = '마스트')    AS cnt_mast,
          COUNT(*) FILTER (WHERE a.part_type = '월타이')    AS cnt_wall,
          COUNT(*) FILTER (WHERE a.part_type = '세대발판')  AS cnt_stage,
          COUNT(*) FILTER (WHERE a.part_type = '안전문')    AS cnt_gate
        FROM jeongho_projects p
        LEFT JOIN assign a ON a.project_no = p.project_no
        ${whereSql}
        GROUP BY p.project_no, p.project_name, p.client_name, p.site_name, p.contract_date, p.start_date, p.end_date, p.status
        ORDER BY p.start_date NULLS LAST, p.project_no;
      `;
            const { rows } = await client.query(sql, params);
            const mapped = (rows || []).map((r) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    project_no: r.project_no,
                    project_name: r.project_name,
                    client_name: r.client_name,
                    site_name: r.site_name,
                    contract_date: r.contract_date,
                    start_date: r.start_date,
                    end_date: r.end_date,
                    status: r.status,
                    cnt_cage: Number((_a = r.cnt_cage) !== null && _a !== void 0 ? _a : 0),
                    cnt_mast: Number((_b = r.cnt_mast) !== null && _b !== void 0 ? _b : 0),
                    cnt_wall: Number((_c = r.cnt_wall) !== null && _c !== void 0 ? _c : 0),
                    cnt_stage: Number((_d = r.cnt_stage) !== null && _d !== void 0 ? _d : 0),
                    cnt_gate: Number((_e = r.cnt_gate) !== null && _e !== void 0 ? _e : 0),
                    assigned_parts: (_f = r.assigned_parts) !== null && _f !== void 0 ? _f : [],
                });
            });
            res.json(mapped);
        }
        catch (err) {
            console.error("[overview] error:", err);
            res.status(500).json({ error: "overview 실패" });
        }
        finally {
            client.release();
        }
    });
    //#endregion -------------------------------------------------------------
    return router;
}
