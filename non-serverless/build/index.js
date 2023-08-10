"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const apiUrl = "http://10.158.0.111:81/api/tokens";
const requestData = {
    identity: "kiet@kietnh.com",
    secret: "matkhaucuagateway"
};
axios_1.default
    .post(apiUrl, requestData)
    .then((response) => {
    console.log("Response:", response.data);
})
    .catch((error) => {
    console.error("Error:", error);
});
