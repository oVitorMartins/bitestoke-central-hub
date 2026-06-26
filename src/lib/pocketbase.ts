import PocketBase from "pocketbase";

export const pb = new PocketBase("http://100.9.8.103");

export async function createAuditLog(ativoId: string, acao: string, descricao: string) {
  try {
    const currentUserId = pb.authStore.model?.id || null;
    await pb.collection("auditoria").create({
      ...(currentUserId ? { usuario: currentUserId } : {}),
      acao,
      descricao,
      ativo_vinculado: ativoId,
    }, { $autoCancel: false });
  } catch (err) {
    console.error("Failed to create central audit log", err);
  }
}
