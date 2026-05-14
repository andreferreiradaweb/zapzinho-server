import { ContactListRepository } from "@/repositories/prospecting";
import { ResourceNotFound } from "@/error/resource-not-found";
import { InvalidCredentialsError } from "@/error/invalid-credentials-error";

type TargetStatus = "WARMUP_SENT" | "TEMPLATE_SENT";

export class MarkContactStatusUseCase {
  constructor(private contactListRepository: ContactListRepository) {}

  async execute(
    contactId: string,
    userId: string,
    target: TargetStatus,
  ): Promise<void> {
    const contact = await this.contactListRepository.getContact(contactId);
    if (!contact) throw new ResourceNotFound();

    const list = await this.contactListRepository.findById(
      contact.contactListId,
    );
    if (!list || list.userId !== userId) throw new InvalidCredentialsError();

    if (target === "WARMUP_SENT") {
      await this.contactListRepository.updateContactStatus(
        contactId,
        "WARMUP_SENT",
        {
          warmupSentAt: new Date(),
        },
      );
    } else {
      await this.contactListRepository.updateContactStatus(
        contactId,
        "TEMPLATE_SENT",
        {
          templateSentAt: new Date(),
        },
      );
    }
  }
}
