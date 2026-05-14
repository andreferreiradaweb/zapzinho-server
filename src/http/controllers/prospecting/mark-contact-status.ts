import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeMarkContactStatus } from "@/factory/prospecting/make-mark-contact-status";
import { ResourceNotFound } from "@/error/resource-not-found";
import { InvalidCredentialsError } from "@/error/invalid-credentials-error";

const paramsSchema = z.object({
  contactId: z.string().uuid(),
  action: z.enum(["mark-warmup-sent", "mark-template-sent"]),
});

export async function markContactStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { contactId, action } = paramsSchema.parse(request.params);
  const userId = request.user.sub;

  try {
    const target =
      action === "mark-warmup-sent" ? "WARMUP_SENT" : "TEMPLATE_SENT";
    await makeMarkContactStatus().execute(contactId, userId, target);
    return reply.status(200).send({ message: "Status atualizado" });
  } catch (err) {
    if (err instanceof ResourceNotFound)
      return reply.status(404).send({ message: "Contato não encontrado" });
    if (err instanceof InvalidCredentialsError)
      return reply.status(403).send({ message: "Forbidden" });
    throw err;
  }
}
