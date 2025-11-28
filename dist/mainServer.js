"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const path_1 = __importDefault(require("path"));
// ✅ .env 로딩
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5050;
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501", // ✅ 실제 Live Server 주소
    "http://127.0.0.1:5502",
    "http://localhost:5500",
    "http://localhost:5501",
    "http://localhost:5050",
    "https://tgyeo.github.io",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`🚫 CORS 차단됨: ${origin}`);
            callback(new Error("CORS 정책에 의해 차단된 요청입니다."));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control", // ✅ 추가됨
        "X-Requested-With",
    ],
}));
app.use(express_1.default.json());
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../docs")));
// ✅ PostgreSQL 연결 설정
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
});
// ✅ DB 연결 테스트
pool.query("SELECT 1")
    .then(() => console.log("✅ PostgreSQL 연결 성공"))
    .catch((err) => {
    console.error("❌ PostgreSQL 연결 실패:", err.message);
    process.exit(1);
});
// ✅ 루트 경로
app.get("/", (req, res) => {
    res.send("✅ 서버 정상 작동 중입니다! (루트 경로)");
});
// ✅ Health Check
app.get("/api/health", async (req, res) => {
    var _a;
    try {
        await pool.query("SELECT 1");
        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({
            ok: true,
            server: "ok",
            db: "ok",
            uptimeSec: Math.round(process.uptime()),
            now: new Date().toISOString(),
            env: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : "development",
        });
    }
    catch (err) {
        res.status(500).json({
            ok: false,
            server: "ok",
            db: "error",
            message: err.message,
            now: new Date().toISOString(),
        });
    }
});
// ✅ 라우터 불러오기
const login_server_1 = __importDefault(require("./login-server"));
const user_register_server_1 = __importDefault(require("./user-register-server"));
const innomax_projects_server_1 = __importDefault(require("./innomax-projects-server"));
const innomax_works_server_1 = __importDefault(require("./innomax-works-server"));
const innomax_progress_server_1 = __importDefault(require("./innomax-progress-server"));
// ✅ 라우터 주입
app.use("/api/login", (0, login_server_1.default)(pool));
app.use("/api/users", (0, user_register_server_1.default)(pool));
app.use("/api/innomax-projects", (0, innomax_projects_server_1.default)(pool));
app.use("/api/innomax-works", (0, innomax_works_server_1.default)(pool));
app.use("/api/innomax-progress", (0, innomax_progress_server_1.default)(pool));
// ✅ 서버 실행
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// ✅ 서버 연결 확인용 핑(Ping) 엔드포인트
app.get("/api/ping", (req, res) => {
    res.json({ status: "ok", message: "서버 연결 정상" });
});
