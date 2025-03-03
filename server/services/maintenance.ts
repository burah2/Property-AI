import { MaintenanceRequest, MaintenanceReport, MAINTENANCE_CATEGORIES } from "@shared/schema";
import { storage } from "../storage";
import nodemailer from "nodemailer";
import AfricasTalking from "africastalking";

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY!,
  username: process.env.AFRICASTALKING_USERNAME!,
});

export async function createMaintenanceRequest(
  request: Omit<MaintenanceRequest, "id" | "assignedStaffId" | "status" | "createdAt" | "completedAt" | "resolution">
): Promise<MaintenanceRequest> {
  // Create the maintenance request first without staff assignment
  const maintenanceRequest = await storage.createMaintenanceRequest({
    ...request,
    assignedStaffId: null,
    status: "pending",
    createdAt: new Date(),
    completedAt: null,
    resolution: null,
  });

  try {
    // Determine the required specialization based on the maintenance category
    const requiredSpecialization = MAINTENANCE_CATEGORIES[request.category as keyof typeof MAINTENANCE_CATEGORIES];

    // Find available staff with the required specialization
    const availableStaff = await storage.getStaffBySpecialization(requiredSpecialization);

    if (availableStaff) {
      // Update the request with assigned staff
      const updatedRequest = await storage.updateMaintenanceRequest(maintenanceRequest.id, {
        assignedStaffId: availableStaff.id,
        status: "assigned",
      });

      // Notify assigned staff
      await notifyStaff(availableStaff, updatedRequest);

      // Notify tenant that request has been created and assigned
      const tenant = await storage.getUser(request.tenantId);
      if (tenant) {
        await notifyTenant(tenant, updatedRequest, "created");
      }

      return updatedRequest;
    } else {
      // If no staff available, keep the request in pending state
      return maintenanceRequest;
    }
  } catch (error) {
    // If there's an error in staff assignment, the request still exists in pending state
    console.error("Error assigning staff to maintenance request:", error);
    return maintenanceRequest;
  }
}

export async function completeMaintenanceRequest(
  requestId: number,
  report: Omit<MaintenanceReport, "id" | "requestId" | "createdAt">
): Promise<void> {
  // Create maintenance report
  const maintenanceReport = await storage.createMaintenanceReport({
    ...report,
    requestId,
  });

  // Update request status
  const request = await storage.getMaintenanceRequest(requestId);
  if (!request) {
    throw new Error("Maintenance request not found");
  }

  await storage.updateMaintenanceRequest(requestId, {
    status: "completed",
    completedAt: new Date(),
    resolution: report.description,
  });

  // Notify tenant
  const tenant = await storage.getUser(request.tenantId);
  if (tenant) {
    await notifyTenant(tenant, request, "completed", maintenanceReport);
  }

  // Notify landlord
  const property = await storage.getProperty(request.propertyId);
  if (property) {
    const landlord = await storage.getUser(property.landlordId);
    if (landlord) {
      await notifyLandlord(landlord, request, maintenanceReport);
    }
  }
}

async function notifyStaff(staff: any, request: MaintenanceRequest) {
  const emailContent = `
    New maintenance request assigned:
    Category: ${request.category}
    Description: ${request.description}
    Priority: ${request.priority}
    Location: Unit ${request.propertyId}
  `;

  // Send email
  await emailTransporter.sendMail({
    to: staff.email,
    subject: "New Maintenance Request Assigned",
    html: emailContent,
  });

  // Send SMS
  if (staff.phone) {
    await africastalking.SMS.send({
      to: staff.phone,
      message: `New maintenance request assigned: ${request.category} - ${request.description}. Priority: ${request.priority}`,
    });
  }
}

async function notifyTenant(tenant: any, request: MaintenanceRequest, status: "created" | "completed", report?: MaintenanceReport) {
  let emailContent = "";
  let smsContent = "";

  if (status === "created") {
    emailContent = `
      Your maintenance request has been created and assigned:
      Category: ${request.category}
      Description: ${request.description}
      Status: Assigned to maintenance staff
      We will keep you updated on the progress.
    `;
    smsContent = `Your maintenance request for ${request.category} has been assigned to our staff. We'll keep you updated.`;
  } else {
    emailContent = `
      Your maintenance request has been completed:
      Category: ${request.category}
      Resolution: ${report?.workDone}
      Completed on: ${request.completedAt}
      Thank you for your patience.
    `;
    smsContent = `Your maintenance request for ${request.category} has been completed. Please check your email for details.`;
  }

  // Send email
  await emailTransporter.sendMail({
    to: tenant.email,
    subject: `Maintenance Request ${status === "created" ? "Update" : "Completed"}`,
    html: emailContent,
  });

  // Send SMS
  if (tenant.phone) {
    await africastalking.SMS.send({
      to: tenant.phone,
      message: smsContent,
    });
  }
}

async function notifyLandlord(landlord: any, request: MaintenanceRequest, report: MaintenanceReport) {
  const emailContent = `
    Maintenance request completed:
    Category: ${request.category}
    Description: ${request.description}
    Resolution: ${report.workDone}
    Cost: $${report.cost}
    Time Spent: ${report.timeSpent}
    Materials Used: ${JSON.stringify(report.materials)}
  `;

  // Send email
  await emailTransporter.sendMail({
    to: landlord.email,
    subject: "Maintenance Request Completed",
    html: emailContent,
  });
}