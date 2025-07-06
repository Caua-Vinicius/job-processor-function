import { IInputData } from "../schemas/job.schema";

export type MessageType = {
  jobId: string;
  inputData: IInputData;
};
