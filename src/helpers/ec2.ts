import { EC2 } from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const ec2 = new EC2({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!
});

const INSTANCE_ID = process.env.AWS_INSTANCE_ID!;

export const startInstance = async () => {
    await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};

export const stopInstance = async () => {
    await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};
