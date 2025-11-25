"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = inspectionRouter;
const express_1 = require("express");
function inspectionRouter(pool) {
    const router = (0, express_1.Router)();
    // ✅ 점검 로그 조회
    router.get("/", async (req, res, next) => {
        try {
            const result = await pool.query("SELECT * FROM inspection_logs ORDER BY inspected_at DESC");
            res.json(result.rows);
        }
        catch (err) {
            next(err);
        }
    });
    // ✅ 점검 로그 등록
    router.post("/", async (req, res, next) => {
        const { part_id, status, notes } = req.body;
        if (!part_id || !status) {
            res.status(400).json({ success: false, error: "필수값 누락" });
            return;
        }
        try {
            await pool.query(`INSERT INTO inspection_logs (part_id, status, notes, inspected_at) VALUES ($1, $2, $3, NOW())`, [part_id, status, notes]);
            res.status(201).json({ success: true });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
