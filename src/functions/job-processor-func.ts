import { app, InvocationContext } from "@azure/functions";
import { MessageType } from "../shared/types/message.type";
import { connectToDatabase } from "../shared/database";
import { Connection, Model } from "mongoose";
import { IJob, JobStatus } from "../shared/schemas/job.schema";
import { uploadPdfBuffer } from "../shared/blob.service";
import { generateInvoicePdf } from "../shared/pdf.service";

export async function job_processor_func(
  message: MessageType,
  context: InvocationContext
): Promise<void> {
  const { jobId, inputData } = message;

  if (!jobId || !inputData) {
    context.error(
      "Invalid message format. 'jobId' and 'inputData' are required."
    );
    return;
  }
  let dbConnection: Connection;

  try {
    dbConnection = await connectToDatabase();
    const JobModel: Model<IJob> = dbConnection.model<IJob>("Job");

    // Update the job status
    await JobModel.findByIdAndUpdate(jobId, {
      $set: { status: JobStatus.PROCESSING },
    });

    // Create the invoice PDF
    const pdfBuffer = await generateInvoicePdf(inputData);

    // Upload the PDF to blob storage
    const blobName = `invoice-${jobId}.pdf`;
    const blobUrl = await uploadPdfBuffer(pdfBuffer, blobName);

    // Update the job with the result
    await JobModel.findByIdAndUpdate(jobId, {
      $set: {
        status: JobStatus.COMPLETED,
        result: {
          blobUrl: blobUrl,
          fileSize: pdfBuffer.length,
        },
      },
    });
  } catch (error) {
    if (dbConnection) {
      const JobModel: Model<IJob> = dbConnection.model<IJob>("Job");
      await JobModel.findByIdAndUpdate(jobId, {
        $set: {
          status: JobStatus.FAILED,
          errorDetails: error.message || "An error occurred",
        },
      });
    }
  }
}

app.serviceBusQueue("job-processor-func", {
  connection: "SERVICE_BUS_CONNECTION_STRING",
  queueName: "%QUEUE_NAME%",
  handler: job_processor_func,
});
