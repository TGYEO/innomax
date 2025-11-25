"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = partsServer;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
function partsServer(pool) {
    // ✅ Parts 리스트 조회
    router.get("/", async (req, res) => {
        try {
            const { division, category, name, site, status } = req.query;
            let query = `SELECT * FROM "jeongho_parts" WHERE 1=1`;
            const params = [];
            if (division) {
                params.push(division);
                query += ` AND division = $${params.length}`;
            }
            if (category) {
                params.push(category);
                query += ` AND category = $${params.length}`;
            }
            if (name) {
                params.push(`%${name}%`);
                query += ` AND name ILIKE $${params.length}`;
            }
            if (site) {
                params.push(`%${site}%`);
                query += ` AND site ILIKE $${params.length}`;
            }
            if (status) {
                params.push(status);
                query += ` AND status = $${params.length}`;
            }
            query += ` ORDER BY no DESC`;
            const result = await pool.query(query, params);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Parts 조회 실패" });
        }
    });
    // ✅ Parts 추가
    router.post("/", async (req, res) => {
        try {
            const { division, category, name, code, spec_load, spec_type, spec_speed, spec_cage_size, site, status, last_inspection_date, } = req.body;
            const result = await pool.query(`INSERT INTO "jeongho_parts"
        (division, category, name, code, spec_load, spec_type, spec_speed, spec_cage_size, site, status, last_inspection_date)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *`, [
                division,
                category,
                name,
                code,
                spec_load,
                spec_type,
                spec_speed,
                spec_cage_size,
                site,
                status,
                last_inspection_date,
            ]);
            res.json(result.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Parts 추가 실패" });
        }
    });
    // ✅ 코드 자동 생성
    router.get("/gen-code/:name", async (req, res) => {
        try {
            const name = req.params.name;
            // 동일 품명의 코드 최대값 찾기
            const result = await pool.query(`SELECT code FROM "jeongho_parts" WHERE name = $1 ORDER BY code DESC LIMIT 1`, [name]);
            let newCode = "";
            if (result.rows.length === 0) {
                // 첫 번째라면 _1 부여
                newCode = `${name}_1`;
            }
            else {
                // 마지막 번호를 추출 후 +1
                const lastCode = result.rows[0].code;
                const match = lastCode.match(/_(\d+)$/);
                const nextNum = match ? parseInt(match[1]) + 1 : 1;
                newCode = `${name}_${nextNum}`;
            }
            res.json({ code: newCode });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "코드 생성 실패" });
        }
    });
    return router;
}
