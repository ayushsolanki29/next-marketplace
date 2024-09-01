"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = void 0;
var stripe_1 = require("./lib/stripe");
var get_payload_1 = require("./get-payload");
var nodemailer_1 = __importDefault(require("nodemailer"));
var ReceiptEmail_1 = require("./components/emails/ReceiptEmail");
var stripeWebhookHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var webhookRequest, body, signature, event, session, payload, users, user, orders, order, transporter, emailHtmlPromise, _a, emailHtml, info, error_1;
    var _b;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                webhookRequest = req;
                body = webhookRequest.rawBody;
                signature = req.headers["stripe-signature"] || "";
                try {
                    event = stripe_1.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
                }
                catch (err) {
                    return [2 /*return*/, res
                            .status(400)
                            .send("Webhook Error: ".concat(err instanceof Error ? err.message : "Unknown Error"))];
                }
                session = event.data.object;
                if (!((_c = session === null || session === void 0 ? void 0 : session.metadata) === null || _c === void 0 ? void 0 : _c.userId) || !((_d = session === null || session === void 0 ? void 0 : session.metadata) === null || _d === void 0 ? void 0 : _d.orderId)) {
                    return [2 /*return*/, res.status(400).send("Webhook Error: No user present in metadata")];
                }
                if (!(event.type === "checkout.session.completed")) return [3 /*break*/, 11];
                return [4 /*yield*/, (0, get_payload_1.getPayLoadClient)()];
            case 1:
                payload = _e.sent();
                return [4 /*yield*/, payload.find({
                        collection: "users",
                        where: {
                            id: {
                                equals: session.metadata.userId,
                            },
                        },
                    })];
            case 2:
                users = (_e.sent()).docs;
                user = users[0];
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: "No such user exists." })];
                return [4 /*yield*/, payload.find({
                        collection: "orders",
                        depth: 2,
                        where: {
                            id: {
                                equals: session.metadata.orderId,
                            },
                        },
                    })];
            case 3:
                orders = (_e.sent()).docs;
                order = orders[0];
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: "No such order exists." })];
                return [4 /*yield*/, payload.update({
                        collection: "orders",
                        data: {
                            _isPaid: true,
                        },
                        where: {
                            id: {
                                equals: session.metadata.orderId,
                            },
                        },
                    })];
            case 4:
                _e.sent();
                transporter = nodemailer_1.default.createTransport({
                    host: "smtp.gmail.com",
                    secure: true,
                    port: 465,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD,
                    },
                });
                _a = ReceiptEmail_1.ReceiptEmailHtml;
                _b = {
                    date: new Date(),
                    email: user.email,
                    orderId: session.metadata.orderId
                };
                return [4 /*yield*/, order.products];
            case 5:
                emailHtmlPromise = _a.apply(void 0, [(_b.products = (_e.sent()),
                        _b)]);
                return [4 /*yield*/, emailHtmlPromise];
            case 6:
                emailHtml = _e.sent();
                _e.label = 7;
            case 7:
                _e.trys.push([7, 9, , 10]);
                return [4 /*yield*/, transporter.sendMail({
                        from: "\"Digital Hippo\" <".concat(process.env.SMTP_USER, ">"),
                        to: user.email,
                        subject: "Thanks for your order! This is your receipt.",
                        html: emailHtml,
                    })];
            case 8:
                info = _e.sent();
                console.log("Message sent: %s", info.messageId);
                return [3 /*break*/, 10];
            case 9:
                error_1 = _e.sent();
                console.error("Error sending email:", error_1);
                res.status(500).json({ error: "Failed to send email" });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/, res.status(200).send()];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.stripeWebhookHandler = stripeWebhookHandler;
