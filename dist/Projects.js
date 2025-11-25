"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = projectsRouter;
const express_1 = require("express");
function projectsRouter(pool) {
    const router = (0, express_1.Router)();
    // ✅ 프로젝트 목록 조회
    router.get("/", async (req, res, next) => {
        try {
            const result = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
            res.json(result.rows);
        }
        catch (err) {
            next(err);
        }
    });
    // ✅ 프로젝트 등록
    router.post("/", async (req, res, next) => {
        const { title, description } = req.body;
        if (!title) {
            res.status(400).json({ success: false, error: "제목은 필수입니다" });
            return;
        }
        try {
            await pool.query(`INSERT INTO projects (title, description, created_at) VALUES ($1, $2, NOW())`, [title, description]);
            res.status(201).json({ success: true });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
