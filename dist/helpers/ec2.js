"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopInstance = exports.startInstance = void 0;
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ec2 = new aws_sdk_1.EC2({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const INSTANCE_ID = process.env.AWS_INSTANCE_ID;
const startInstance = async () => {
    await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};
exports.startInstance = startInstance;
const stopInstance = async () => {
    await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};
exports.stopInstance = stopInstance;
