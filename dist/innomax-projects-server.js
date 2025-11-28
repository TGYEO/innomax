"use strict";
// server/innomax-projects-server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = innomaxProjectsRouter;
const express_1 = __importDefault(require("express"));
function innomaxProjectsRouter(pool) {
    const router = express_1.default.Router();
    // ✅ 수주건 저장 (INSERT / UPDATE)
    router.post("/", async (req, res) => {
        var _a;
        try {
            const detail = req.body;
            const id = (_a = detail.orderNo) === null || _a === void 0 ? void 0 : _a.trim();
            if (!id) {
                return res
                    .status(400)
                    .json({ ok: false, message: "수주건번호(orderNo)가 없습니다." });
            }
            const query = `
        INSERT INTO public.innomax_projects (code_no, detail_json)
        VALUES ($1, $2)
        ON CONFLICT (code_no)
        DO UPDATE SET detail_json = EXCLUDED.detail_json
      `;
            await pool.query(query, [id, detail]);
            return res.json({ ok: true, message: "저장되었습니다." });
        }
        catch (err) {
            console.error("❌ [innomax_projects] save error:", err);
            return res
                .status(500)
                .json({ ok: false, message: "서버 오류가 발생했습니다." });
        }
    });
    // ✅ 수주건 리스트 조회
    router.get("/", async (req, res) => {
        try {
            const { rows } = await pool.query(`
        SELECT code_no, detail_json
        FROM public.innomax_projects
        ORDER BY code_no DESC
      `);
            return res.json({ ok: true, rows });
        }
        catch (err) {
            console.error("❌ [innomax_projects] list error:", err);
            return res
                .status(500)
                .json({ ok: false, message: "조회 중 서버 오류가 발생했습니다." });
        }
    });
    return router;
}
