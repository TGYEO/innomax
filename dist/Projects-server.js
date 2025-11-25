"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = projectsServer;
const express_1 = __importDefault(require("express"));
const dayjs_1 = __importDefault(require("dayjs"));
const router = express_1.default.Router();
function projectsServer(pool) {
    //#region ✅ 프로젝트 중복 확인 --------------------------------------------
    router.get("/:project_no/exists", async (req, res) => {
        const { project_no } = req.params;
        try {
            const check = await pool.query(`SELECT 1 FROM jeongho_projects WHERE project_no=$1 LIMIT 1;`, [project_no]);
            res.json({ exists: check.rows.length > 0 });
        }
        catch (err) {
            console.error("❌ 프로젝트 중복 확인 실패:", err);
            res.status(500).json({ error: "프로젝트 중복 확인 실패" });
        }
    });
    //#endregion ---------------------------------------------------------------
    //#region ✅ 프로젝트 전체 조회 --------------------------------------------
    router.get("/", async (req, res) => {
        try {
            const result = await pool.query(`
        SELECT project_no, project_name, client_name, site_name, contract_date, start_date, end_date, status
        FROM jeongho_projects
        ORDER BY contract_date DESC;
      `);
            res.json(result.rows);
        }
        catch (err) {
            console.error("프로젝트 조회 실패:", err);
            res.status(500).json({ error: "프로젝트 조회 실패" });
        }
    });
    //#endregion ---------------------------------------------------------------
    //#region ✅ 특정 프로젝트 상세 조회 ----------------------------------------
    router.get("/:project_no", async (req, res) => {
        const { project_no } = req.params;
        try {
            const project = await pool.query(`SELECT * FROM jeongho_projects WHERE project_no=$1`, [project_no]);
            if (project.rows.length === 0)
                return res.status(404).json({ error: "해당 프로젝트 없음" });
            const donghos = await pool.query(`SELECT * FROM jeongho_projects_dongho WHERE project_no=$1 ORDER BY id ASC`, [project_no]);
            const usingParts = await pool.query(`
        SELECT up.*, p.name AS part_name, p.category, d.dong, d.ho
        FROM jeongho_projects_dongho_using_parts up
        JOIN jeongho_projects_dongho d ON up.dongho_id = d.id
        JOIN jeongho_parts p ON up.part_code = p.code
        WHERE d.project_no = $1
        ORDER BY d.id ASC;
        `, [project_no]);
            res.json({
                project: project.rows[0],
                donghos: donghos.rows,
                using_parts: usingParts.rows,
            });
        }
        catch (err) {
            console.error("프로젝트 상세 조회 실패:", err);
            res.status(500).json({ error: "프로젝트 상세 조회 실패" });
        }
    });
    //#endregion ---------------------------------------------------------------
    //#region ✅ 신규 프로젝트 등록 (site 반영) -----------------------------------
    router.post("/", async (req, res) => {
        var _a, _b, _c;
        const client = await pool.connect();
        try {
            const { project_no, project_name, client_name, site_name, contract_date, start_date, end_date, status, dong_ho_data, } = req.body;
            await client.query("BEGIN");
            // 1️⃣ 프로젝트 기본 정보
            await client.query(`
        INSERT INTO jeongho_projects 
          (project_no, project_name, client_name, site_name, contract_date, start_date, end_date, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (project_no) DO UPDATE 
          SET project_name=$2, client_name=$3, site_name=$4, 
              contract_date=$5, start_date=$6, end_date=$7, status=$8;
        `, [project_no, project_name, client_name, site_name, contract_date, start_date, end_date, status]);
            // 2️⃣ 장비 + 동호 등록
            for (const block of dong_ho_data || []) {
                const dongMatch = block.dong_ho.match(/(\d+)동/);
                const hoMatch = block.dong_ho.match(/(\d+)호기/);
                const dong = dongMatch ? dongMatch[1] : block.dong_ho;
                const ho = hoMatch ? hoMatch[1] : "";
                const dongRes = await client.query(`
          INSERT INTO jeongho_projects_dongho (project_no, dong, ho)
          VALUES ($1,$2,$3)
          ON CONFLICT (project_no, dong, ho) DO NOTHING
          RETURNING id;
          `, [project_no, dong, ho]);
                const dongho_id = (_b = (_a = dongRes.rows[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = (await client.query(`SELECT id FROM jeongho_projects_dongho WHERE project_no=$1 AND dong=$2 AND ho=$3;`, [project_no, dong, ho])).rows[0]) === null || _c === void 0 ? void 0 : _c.id;
                if (!dongho_id)
                    continue;
                for (const equip of block.equips || []) {
                    const assignedAt = (0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss");
                    await client.query(`
            INSERT INTO jeongho_projects_dongho_using_parts (dongho_id, part_code, part_type, assigned_at)
            VALUES ($1,$2,$3,$4)
            ON CONFLICT (dongho_id, part_code) DO NOTHING;
            `, [dongho_id, equip.code, equip.category, assignedAt]);
                    // ✅ site 반영 추가
                    await client.query(`UPDATE jeongho_parts SET status='사용중', site=$1 WHERE code=$2;`, [site_name, equip.code]);
                    await client.query(`
            INSERT INTO jeongho_parts_using_log (part_code, project_no, dongho_id, site, start_date)
            VALUES ($1,$2,$3,$4,$5)
            ON CONFLICT DO NOTHING;
            `, [equip.code, project_no, dongho_id, site_name, assignedAt]);
                }
            }
            await client.query("COMMIT");
            res.json({ success: true, message: "✅ 프로젝트 등록 완료" });
        }
        catch (err) {
            await client.query("ROLLBACK");
            console.error("❌ 프로젝트 등록 실패:", err);
            res.status(500).json({ error: "프로젝트 등록 실패" });
        }
        finally {
            client.release();
        }
    });
    //#endregion ---------------------------------------------------------------
    //#region ✅ 프로젝트 수정 (site 반영 포함) -----------------------------------
    router.put("/:project_no", async (req, res) => {
        var _a, _b, _c;
        const { project_no } = req.params;
        const client = await pool.connect();
        try {
            const { project_name, client_name, site_name, contract_date, start_date, end_date, status, dong_ho_data, } = req.body;
            await client.query("BEGIN");
            // 🔹 프로젝트 기본정보 업데이트
            await client.query(`
        UPDATE jeongho_projects
        SET project_name=$1, client_name=$2, site_name=$3,
            contract_date=$4, start_date=$5, end_date=$6, status=$7
        WHERE project_no=$8;
        `, [project_name, client_name, site_name, contract_date, start_date, end_date, status, project_no]);
            // 🔹 완료 시 장비 해제
            if (status === "완료") {
                const parts = (await client.query(`
            SELECT up.part_code FROM jeongho_projects_dongho_using_parts up
            JOIN jeongho_projects_dongho d ON up.dongho_id = d.id
            WHERE d.project_no=$1;
            `, [project_no])).rows;
                for (const { part_code } of parts) {
                    await client.query(`UPDATE jeongho_parts SET status='대기', site='' WHERE code=$1;`, [part_code]);
                    await client.query(`
            UPDATE jeongho_parts_using_log
            SET end_date=$1
            WHERE part_code=$2 AND project_no=$3 AND end_date IS NULL;
            `, [(0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss"), part_code, project_no]);
                }
                await client.query(`DELETE FROM jeongho_projects_dongho_using_parts WHERE dongho_id IN (SELECT id FROM jeongho_projects_dongho WHERE project_no=$1);`, [project_no]);
            }
            // 🔹 장비 변경 로직
            else {
                const oldParts = (await client.query(`
            SELECT up.part_code
            FROM jeongho_projects_dongho_using_parts up
            JOIN jeongho_projects_dongho d ON up.dongho_id = d.id
            WHERE d.project_no=$1;
            `, [project_no])).rows.map(r => r.part_code);
                const newParts = new Set();
                for (const b of dong_ho_data || [])
                    for (const e of b.equips || [])
                        newParts.add(e.code);
                const removed = oldParts.filter(c => !newParts.has(c));
                const added = [...newParts].filter(c => !oldParts.includes(c));
                for (const code of removed) {
                    await client.query(`UPDATE jeongho_parts SET status='대기', site='' WHERE code=$1;`, [code]);
                    await client.query(`UPDATE jeongho_parts_using_log SET end_date=$1 WHERE part_code=$2 AND project_no=$3 AND end_date IS NULL;`, [(0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss"), code, project_no]);
                }
                for (const block of dong_ho_data || []) {
                    const dongMatch = block.dong_ho.match(/(\d+)동/);
                    const hoMatch = block.dong_ho.match(/(\d+)호기/);
                    const dong = dongMatch ? dongMatch[1] : block.dong_ho;
                    const ho = hoMatch ? hoMatch[1] : "";
                    let dongho_id = (_b = (_a = (await client.query(`SELECT id FROM jeongho_projects_dongho WHERE project_no=$1 AND dong=$2 AND ho=$3;`, [project_no, dong, ho])).rows[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = (await client.query(`INSERT INTO jeongho_projects_dongho (project_no,dong,ho) VALUES ($1,$2,$3) RETURNING id;`, [project_no, dong, ho])).rows[0]) === null || _c === void 0 ? void 0 : _c.id;
                    for (const e of block.equips || []) {
                        if (!added.includes(e.code))
                            continue;
                        const assignedAt = (0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss");
                        await client.query(`
              INSERT INTO jeongho_projects_dongho_using_parts (dongho_id, part_code, part_type, assigned_at)
              VALUES ($1,$2,$3,$4)
              ON CONFLICT DO NOTHING;
              `, [dongho_id, e.code, e.category, assignedAt]);
                        await client.query(`UPDATE jeongho_parts SET status='사용중', site=$1 WHERE code=$2;`, [site_name, e.code]);
                        await client.query(`
              INSERT INTO jeongho_parts_using_log (part_code, project_no, dongho_id, site, start_date)
              VALUES ($1,$2,$3,$4,$5)
              ON CONFLICT DO NOTHING;
              `, [e.code, project_no, dongho_id, site_name, assignedAt]);
                    }
                }
            }
            await client.query("COMMIT");
            res.json({ success: true, message: "프로젝트 수정 완료" });
        }
        catch (err) {
            await client.query("ROLLBACK");
            console.error("❌ 프로젝트 수정 실패:", err);
            res.status(500).json({ error: "프로젝트 수정 실패" });
        }
        finally {
            client.release();
        }
    });
    //#endregion ---------------------------------------------------------------
    //#region ✅ 프로젝트 삭제 (site 해제 포함) -----------------------------------
    router.delete("/:project_no", async (req, res) => {
        const { project_no } = req.params;
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const partCodes = (await client.query(`
          SELECT up.part_code
          FROM jeongho_projects_dongho_using_parts up
          JOIN jeongho_projects_dongho d ON up.dongho_id=d.id
          WHERE d.project_no=$1;
          `, [project_no])).rows.map(r => r.part_code);
            if (partCodes.length > 0) {
                await client.query(`UPDATE jeongho_parts SET status='대기', site='' WHERE code = ANY($1::text[]);`, [partCodes]);
                await client.query(`
          UPDATE jeongho_parts_using_log
          SET end_date=TO_CHAR(NOW(),'YYYY-MM-DD HH24:MI:SS')
          WHERE part_code = ANY($1::text[]) AND project_no=$2 AND end_date IS NULL;
          `, [partCodes, project_no]);
            }
            await client.query(`DELETE FROM jeongho_projects_dongho_using_parts WHERE dongho_id IN (SELECT id FROM jeongho_projects_dongho WHERE project_no=$1);`, [project_no]);
            await client.query(`DELETE FROM jeongho_projects_dongho WHERE project_no=$1;`, [project_no]);
            await client.query(`DELETE FROM jeongho_projects WHERE project_no=$1;`, [project_no]);
            await client.query("COMMIT");
            res.json({ success: true, message: "프로젝트 및 관련 데이터 삭제 완료" });
        }
        catch (err) {
            await client.query("ROLLBACK");
            console.error("❌ 프로젝트 삭제 실패:", err);
            res.status(500).json({ error: "프로젝트 삭제 실패" });
        }
        finally {
            client.release();
        }
    });
    //#endregion ---------------------------------------------------------------
    return router;
}
