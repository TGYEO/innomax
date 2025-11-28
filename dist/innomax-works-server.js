"use strict";
// server/innomax-works-server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = innomaxWorksRouter;
const express_1 = __importDefault(require("express"));
function innomaxWorksRouter(pool) {
    const router = express_1.default.Router();
    // 📌 전체 업무 목록 조회
    router.get("/", async (req, res) => {
        try {
            const { rows } = await pool.query(`
        SELECT id, detail_json
        FROM public.innomax_works
        ORDER BY id DESC
      `);
            return res.json({ ok: true, rows });
        }
        catch (err) {
            console.error("❌ [innomax_works] GET error:", err);
            return res.status(500).json({ ok: false, message: "조회 중 오류 발생" });
        }
    });
    // 📌 업무 저장
    router.post("/", async (req, res) => {
        try {
            const detail = req.body;
            if (!detail.orderNo) {
                return res.status(400).json({ ok: false, message: "orderNo 누락" });
            }
            const now = new Date();
            const ts = now
                .toISOString()
                .replace(/[-:T]/g, "_")
                .replace(/\..+/, ""); // 2025_01_27_13_11_23
            const id = `${ts}_${detail.orderNo}`;
            await pool.query(`
        INSERT INTO public.innomax_works (id, detail_json)
        VALUES ($1, $2)
      `, [id, detail]);
            return res.json({ ok: true, id });
        }
        catch (err) {
            console.error("❌ [innomax_works] POST error:", err);
            return res.status(500).json({ ok: false, message: "저장 중 오류 발생" });
        }
    });
    return router;
}
