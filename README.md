# Job Processor Function

This repository contains the source code for a **serverless background worker**, built with **Azure Functions** and **TypeScript**. This function is a critical component of a larger distributed system, responsible for processing long-running jobs received from a message queue.

Its primary role is to act as the **asynchronous processor** for the [`Async Job Processor API`](https://github.com/Caua-Vinicius/async-processor-api), efficiently handling tasks like PDF generation in a scalable, event-driven architecture.

---

## Role in the System Architecture

This Azure Function serves as the **worker** in an **Asynchronous Request-Reply** pattern. It is fully decoupled from the main API, contributing to system resilience and scalability.

### Workflow Overview

- **Triggering (Azure Service Bus):**  
  Automatically triggered when a new message arrives in the `job-queue`. Each message contains all necessary data for processing.

- **State Management (Azure Cosmos DB):**  
  Upon receiving a job, the function connects to **Cosmos DB** (MongoDB API) and updates the job status to `Processing`, enabling real-time tracking via the main API.

- **Execution (PDF Generation):**  
  The function performs the intensive task of generating a PDF using the lightweight and fast `pdf-lib` library.

- **Artifact Storage (Azure Blob Storage):**  
  The generated PDF is uploaded to a secure, private container in **Azure Blob Storage**.

- **Finalization:**  
  After uploading, the job status is updated to `Completed` with the file URL. If any step fails, the status is marked as `Failed`, along with error details.

---

## Key Design & Security Concepts

A core objective of this project is to implement **production-grade security practices** within the Azure ecosystem.

### Environment Secrets (This Repository)

This function retrieves secrets (connection strings for Cosmos DB, Service Bus, and Blob Storage) from **Application Settings** in the **Azure Portal**. These values are injected as environment variables at runtime, avoiding hardcoded credentials in the source code.

### Managed Identity (Companion API Repository)

The companion API (`Async Job Processor API`) uses **Azure Managed Identity** to authenticate with services. This contrast between the two approaches highlights flexibility and understanding of Azure security best practices.

---

## Technology Stack

- **Framework:** Azure Functions (v4 Programming Model, TypeScript)
- **Database Client:** Mongoose (Cosmos DB via MongoDB API)
- **PDF Generation:** [pdf-lib](https://github.com/Hopding/pdf-lib)
- **Messaging:** `@azure/service-bus` SDK
- **Storage:** `@azure/storage-blob` SDK
- **Node.js Version:** v22.x (recommended for Azure compatibility)

---

## Author

**Cauã Vinicius**  
[LinkedIn Profile](https://www.linkedin.com/in/caua-vinicius/)
