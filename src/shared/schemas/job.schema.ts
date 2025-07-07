import { Schema, Document } from "mongoose";

export enum JobStatus {
  QUEUED = "Queued",
  PROCESSING = "Processing",
  COMPLETED = "Completed",
  FAILED = "Failed",
}

export interface IInputData {
  customerName: string;
  customerEmail: string;
  items: {
    description: string;
    amount: number;
  }[];
}

export interface IJob extends Document {
  status: JobStatus;
  inputData: IInputData;
  result?: {
    blobUrl: string;
    fileSize: number;
  };
  errorDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = new Schema<IJob>(
  {
    status: {
      type: String,
      enum: Object.values(JobStatus),
      required: true,
      default: JobStatus.QUEUED,
    },
    inputData: { type: Object, required: true },
    result: { type: Object, required: false },
    errorDetails: { type: String, required: false },
  },
  {
    collection: "Jobs",
    timestamps: true,
  }
);
