import { db } from "@/db";
import { conversations, conversationParticipants, messages } from "@/db/schema";
import { eq, or, asc } from "drizzle-orm";
import { createError } from "@/utils/errorHandlers";

export const getConversationService = async (conversationId: string) => {
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: { participants: { with: { user: true } }, lastMessage: true },
  });

  if (!conversation) throw createError("conversation not found", 404);
  return conversation;
};

export const getAllMessagesForConversationService = async (conversationId: string) => {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
};

export const getAllConversationsOfUserService = async (userId: string) => {
  // Get conversation IDs where user is a participant
  const participantRows = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  const participantConvIds = participantRows.map((r) => r.conversationId);

  // Get all conversations where user is creator OR participant
  const allConvs = await db.query.conversations.findMany({
    with: {
      participants: { with: { user: true } },
      lastMessage: true,
    },
  });

  return allConvs.filter(
    (c) => c.createdBy === userId || participantConvIds.includes(c.id),
  );
};

export const createNewConversationService = async (
  participantIds: string[],
  title: string,
  createdBy: string,
) => {
  return db.transaction(async (tx) => {
    const [conversation] = await tx
      .insert(conversations)
      .values({ title, createdBy })
      .returning();

    if (participantIds.length > 0) {
      await tx.insert(conversationParticipants).values(
        participantIds.map((userId) => ({ conversationId: conversation.id, userId })),
      );
    }

    return conversation;
  });
};

export const createNewMessageService = async (
  conversationId: string,
  message: string,
  sender: string,
) => {
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });

  if (!conversation) throw createError("conversation not found", 404);

  const [newMessage] = await db
    .insert(messages)
    .values({ conversationId, senderId: sender, text: message })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageId: newMessage.id })
    .where(eq(conversations.id, conversationId));

  return newMessage;
};
