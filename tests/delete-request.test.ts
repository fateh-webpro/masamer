import assert from "node:assert/strict";
import test from "node:test";
import { deleteRequestAction, deleteRequestRecord } from "@/app/admin/requests/actions";
import type { PrismaClient } from "@/generated/prisma/client";

test("deleteRequestAction blocks unauthenticated / unauthorized calls", async () => {
  // Without admin session context, requireAdmin blocks execution
  await assert.rejects(
    async () => {
      await deleteRequestAction("some-request-id");
    },
    (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      return (
        message.includes("غير مصرح") ||
        message.includes("NEXT_REDIRECT") ||
        message.includes("/admin/login") ||
        message.includes("outside a request scope")
      );
    }
  );
});

test("deleteRequestRecord validates request id correctly", async () => {
  // Test with invalid / empty ID
  const emptyRes = await deleteRequestRecord("");
  assert.strictEqual(emptyRes.success, false);
  assert.strictEqual(emptyRes.error, "معرّف الطلب غير صالح");

  const whitespaceRes = await deleteRequestRecord("   ");
  assert.strictEqual(whitespaceRes.success, false);
  assert.strictEqual(whitespaceRes.error, "معرّف الطلب غير صالح");
});

test("deleteRequestRecord returns error for non-existent requests without deleting", async () => {
  const mockDb = {
    serviceRequest: {
      findUnique: async () => null,
      delete: async () => {
        throw new Error("Should not be called");
      },
    },
    serviceRequestItem: {
      deleteMany: async () => {
        throw new Error("Should not be called");
      },
    },
    $transaction: async () => {
      throw new Error("Transaction should not be called when request does not exist");
    },
  } as unknown as PrismaClient;

  const res = await deleteRequestRecord("non-existent-id", mockDb);
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error, "الطلب غير موجود أو تم حذفه مسبقاً");
});

test("deleteRequestRecord deletes only request items and request within transaction", async () => {
  const deletedItemsWhere: unknown[] = [];
  const deletedRequestsWhere: unknown[] = [];

  const mockDb = {
    serviceRequest: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id === "req-456") return { id: "req-456" };
        return null;
      },
      delete: async () => {
        throw new Error("Direct delete should not be called outside transaction");
      },
    },
    serviceRequestItem: {
      deleteMany: async () => {
        throw new Error("Direct deleteMany should not be called outside transaction");
      },
    },
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      const mockTx = {
        serviceRequestItem: {
          deleteMany: async (args: { where: { requestId: string } }) => {
            deletedItemsWhere.push(args.where);
            return { count: 3 };
          },
        },
        serviceRequest: {
          delete: async (args: { where: { id: string } }) => {
            deletedRequestsWhere.push(args.where);
            return { id: "req-456" };
          },
        },
      };
      return await callback(mockTx);
    },
  } as unknown as PrismaClient;

  const res = await deleteRequestRecord("req-456", mockDb);
  assert.strictEqual(res.success, true);
  assert.deepStrictEqual(deletedItemsWhere, [{ requestId: "req-456" }]);
  assert.deepStrictEqual(deletedRequestsWhere, [{ id: "req-456" }]);
});

test("deleteRequestRecord handles transaction errors safely without exposing technical details", async () => {
  const mockDb = {
    serviceRequest: {
      findUnique: async () => ({ id: "req-error" }),
    },
    $transaction: async () => {
      throw new Error("Database connection dropped or constraint failed");
    },
  } as unknown as PrismaClient;

  const res = await deleteRequestRecord("req-error", mockDb);
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error, "تعذر حذف الطلب، يرجى المحاولة لاحقاً");
});
