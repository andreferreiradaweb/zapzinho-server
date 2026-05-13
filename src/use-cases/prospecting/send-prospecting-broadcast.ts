import {
  ContactListRepository,
  ProspectingBroadcastRepository,
} from "@/repositories/prospecting";
import { MessageLogRepository } from "@/repositories/message-log";
import { UserRepository } from "@/repositories/user";
import { ResourceNotFound } from "@/error/resource-not-found";
import { InvalidCredentialsError } from "@/error/invalid-credentials-error";
import {
  sendWhatsAppMessageWithCredentials,
  wapiProspectingDelay,
} from "@/services/wapi";
import { env } from "@/config/validatedEnv";
import { v4 as uuid } from "uuid";

export class SendProspectingBroadcastUseCase {
  constructor(
    private contactListRepository: ContactListRepository,
    private prospectingBroadcastRepository: ProspectingBroadcastRepository,
    private messageLogRepository: MessageLogRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(broadcastId: string, userId: string): Promise<void> {
    const broadcast =
      await this.prospectingBroadcastRepository.findById(broadcastId);
    if (!broadcast) throw new ResourceNotFound();
    if (broadcast.userId !== userId) throw new InvalidCredentialsError();

    if (broadcast.status === "SENDING") return;

    const user = await this.userRepository.findUserById(userId);
    if (!user || !user.prospectingInstanceId || !user.prospectingToken) {
      throw new Error(
        "Credenciais de prospecção não configuradas para este usuário",
      );
    }

    const dailyLimit = env.PROSPECTING_DAILY_LIMIT;
    const todaySent =
      await this.contactListRepository.countWarmupSentToday(userId);
    const remainingToday = Math.max(0, dailyLimit - todaySent);

    if (remainingToday === 0) {
      throw new Error(
        `Limite diário de ${dailyLimit} mensagens de prospecção atingido. Tente novamente amanhã.`,
      );
    }

    await this.prospectingBroadcastRepository.updateStatus(
      broadcastId,
      "SENDING",
      {
        startedAt: new Date(),
      },
    );

    this.runSend(
      broadcast,
      userId,
      user.prospectingInstanceId,
      user.prospectingToken,
      remainingToday,
    ).catch((err) => {
      console.error("[ProspectingBroadcast] Fatal error:", err);
      this.prospectingBroadcastRepository
        .updateStatus(broadcastId, "FAILED")
        .catch(() => null);
    });
  }

  private async runSend(
    broadcast: Awaited<ReturnType<ProspectingBroadcastRepository["findById"]>>,
    userId: string,
    instanceId: string,
    token: string,
    remainingToday: number,
  ) {
    if (!broadcast) return;

    const allowedCategories = broadcast.categoryFilter
      ? broadcast.categoryFilter.split(",").map((s) => s.trim())
      : null;

    const allEligible = broadcast.ContactList.Contacts.filter(
      (c) =>
        !allowedCategories ||
        (c.category !== null && allowedCategories.includes(c.category)),
    );

    const excludedByCategory = allowedCategories
      ? broadcast.ContactList.Contacts.filter((c) => !allEligible.includes(c))
      : [];

    if (excludedByCategory.length > 0) {
      console.log(
        `[ProspectingBroadcast] ${excludedByCategory.length} contatos ignorados por filtro de categoria (${allowedCategories?.join(", ")}): ${excludedByCategory.map((c) => c.phone).join(", ")}`,
      );
      await this.prospectingBroadcastRepository.incrementFailedCount(
        broadcast.id,
        excludedByCategory.length,
      );
    }

    const contacts = allEligible.filter(
      (c) => c.status === "PENDING" || c.status === "FAILED",
    );

    const alreadyReceived = allEligible.filter(
      (c) => !["PENDING", "FAILED"].includes(c.status),
    );

    if (alreadyReceived.length > 0) {
      for (const contact of alreadyReceived) {
        const logId = uuid();
        await this.messageLogRepository.create({
          id: logId,
          userId,
          leadId: null,
          phone: contact.phone,
          message: broadcast.warmupMessage,
          type: "BROADCAST",
          status: "PENDING",
        });
        await this.messageLogRepository.markFailed(
          logId,
          "Número já recebeu mensagem em disparo anterior",
        );
      }
      await this.prospectingBroadcastRepository.incrementFailedCount(
        broadcast.id,
        alreadyReceived.length,
      );
      console.log(
        `[ProspectingBroadcast] ${alreadyReceived.length} contatos bloqueados (já receberam)`,
      );
    }

    const canSend = Math.min(contacts.length, remainingToday);
    const skippedByLimit = contacts.length - canSend;

    console.log(
      `[ProspectingBroadcast] Iniciando id=${broadcast.id} | contatos=${contacts.length} | bloqueados=${alreadyReceived.length} | limite_dia=${remainingToday} | enviando=${canSend}`,
    );

    if (skippedByLimit > 0) {
      console.log(
        `[ProspectingBroadcast] ${skippedByLimit} contatos adiados para amanhã (limite diário)`,
      );
    }

    const messagePool = [
      broadcast.warmupMessage,
      ...(broadcast.warmupVariations as string[]),
    ];

    for (const contact of contacts.slice(0, canSend)) {
      const logId = uuid();
      const message =
        messagePool[Math.floor(Math.random() * messagePool.length)];
      try {
        await this.messageLogRepository.create({
          id: logId,
          userId,
          leadId: null,
          phone: contact.phone,
          message,
          type: "BROADCAST",
          status: "PENDING",
        });

        const result = await sendWhatsAppMessageWithCredentials(
          instanceId,
          token,
          contact.phone,
          message,
        );
        await wapiProspectingDelay();

        if (result.success) {
          await this.contactListRepository.updateContactStatus(
            contact.id,
            "WARMUP_SENT",
            {
              warmupSentAt: new Date(),
            },
          );
          await this.prospectingBroadcastRepository.incrementCount(
            broadcast.id,
            "totalSent",
          );
          await this.messageLogRepository.markSent(logId);
          console.log(
            `[ProspectingBroadcast] ✓ Warmup enviado para ${contact.phone}`,
          );
        } else {
          await this.contactListRepository.updateContactStatus(
            contact.id,
            "FAILED",
            {
              errorMsg: result.error,
            },
          );
          await this.prospectingBroadcastRepository.incrementCount(
            broadcast.id,
            "totalFailed",
          );
          await this.messageLogRepository.markFailed(
            logId,
            result.error ?? "unknown error",
          );
          console.error(
            `[ProspectingBroadcast] ✗ Falha para ${contact.phone}: ${result.error}`,
          );
        }
      } catch (err) {
        console.error(
          `[ProspectingBroadcast] ✗ Exceção para ${contact.phone}:`,
          err,
        );
        await this.contactListRepository
          .updateContactStatus(contact.id, "FAILED", {
            errorMsg: String(err),
          })
          .catch(() => null);
        await this.prospectingBroadcastRepository
          .incrementCount(broadcast.id, "totalFailed")
          .catch(() => null);
        await this.messageLogRepository
          .markFailed(logId, String(err))
          .catch(() => null);
      }
    }

    await this.prospectingBroadcastRepository.updateStatus(
      broadcast.id,
      "SENT",
      {
        finishedAt: new Date(),
      },
    );
    console.log(`[ProspectingBroadcast] Concluído id=${broadcast.id}`);
  }
}
