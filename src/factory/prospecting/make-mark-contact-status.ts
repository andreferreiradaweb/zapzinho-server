import { PrismaContactListRepository } from "@/repositories/prisma/prospecting";
import { MarkContactStatusUseCase } from "@/use-cases/prospecting/mark-contact-status";

export function makeMarkContactStatus() {
  return new MarkContactStatusUseCase(new PrismaContactListRepository());
}
