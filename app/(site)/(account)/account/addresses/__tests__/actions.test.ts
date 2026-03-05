import { revalidatePath } from "next/cache";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import {
  upsertAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/(site)/(account)/account/addresses/actions";

const mockAuth = vi.mocked(auth);
const mockAddressDelete = vi.mocked(prisma.userAddress.delete);
const mockTransaction = vi.mocked(prisma.$transaction);
const mockRevalidatePath = vi.mocked(revalidatePath);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function asLoggedIn(userId = "user_1") {
  mockAuth.mockResolvedValue({ user: { id: userId } } as any);
}

function asGuest() {
  mockAuth.mockResolvedValue(null as any);
}

// Datos de dirección válidos según addressFormSchema
const validAddressData = {
  firstName: "Juan",
  lastName: "García",
  phone: "612345678",
  street: "Calle Mayor 1",
  details: "Piso 2B",
  postalCode: "28001",
  city: "Madrid",
  province: "Madrid",
  country: "España",
  isDefault: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── upsertAddressAction ──────────────────────────────────────────────────────
describe("upsertAddressAction", () => {
  it("devuelve error con id temporal si no hay sesión (modo invitado)", async () => {
    asGuest();

    const result = await upsertAddressAction(validAddressData);

    expect(result.error).toBe("Usuario no identificado");
    expect((result as any).address.id).toBe("guest-temp-id");
  });

  it("devuelve error de validación si los datos son inválidos", async () => {
    asLoggedIn();

    const result = await upsertAddressAction({ firstName: "" });

    expect(result).toHaveProperty("error");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("llama a $transaction para crear una dirección nueva (sin id)", async () => {
    asLoggedIn();

    const txMock = {
      userAddress: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        update: vi.fn().mockResolvedValue({}),
        create: vi
          .fn()
          .mockResolvedValue({ id: "new_addr", ...validAddressData }),
      },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    const result = await upsertAddressAction(validAddressData);

    expect(result).toHaveProperty("success", true);
    expect(txMock.userAddress.create).toHaveBeenCalled();
    expect(txMock.userAddress.update).not.toHaveBeenCalled();
  });

  it("llama a $transaction para actualizar una dirección existente (con id)", async () => {
    asLoggedIn();

    const txMock = {
      userAddress: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        update: vi
          .fn()
          .mockResolvedValue({ id: "addr_1", ...validAddressData }),
        create: vi.fn(),
      },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    const result = await upsertAddressAction({
      ...validAddressData,
      id: "addr_1",
    });

    expect(result).toHaveProperty("success", true);
    expect(txMock.userAddress.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "addr_1", userId: "user_1" } }),
    );
    expect(txMock.userAddress.create).not.toHaveBeenCalled();
  });

  it("desactiva otras direcciones como default cuando isDefault:true", async () => {
    asLoggedIn();

    const txMock = {
      userAddress: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({ id: "new_addr" }),
        update: vi.fn(),
      },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await upsertAddressAction({ ...validAddressData, isDefault: true });

    expect(txMock.userAddress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isDefault: false } }),
    );
  });

  it("llama a revalidatePath tras guardar correctamente", async () => {
    asLoggedIn();

    const txMock = {
      userAddress: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({ id: "new_addr" }),
        update: vi.fn(),
      },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await upsertAddressAction(validAddressData);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/addresses");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/checkout");
  });

  it("devuelve error si $transaction lanza", async () => {
    asLoggedIn();
    mockTransaction.mockRejectedValue(new Error("DB error"));

    const result = await upsertAddressAction(validAddressData);

    expect(result).toEqual({ error: "Error al guardar la dirección." });
  });
});

// ─── deleteAddressAction ──────────────────────────────────────────────────────
describe("deleteAddressAction", () => {
  it("devuelve error si no hay sesión", async () => {
    asGuest();

    const result = await deleteAddressAction("addr_1");
    expect(result).toEqual({ error: "No autorizado" });
  });

  it("borra la dirección y devuelve success:true", async () => {
    asLoggedIn();
    mockAddressDelete.mockResolvedValue({} as any);

    const result = await deleteAddressAction("addr_1");

    expect(result).toEqual({ success: true });
    expect(mockAddressDelete).toHaveBeenCalledWith({
      where: { id: "addr_1", userId: "user_1" },
    });
  });

  it("llama a revalidatePath tras borrar", async () => {
    asLoggedIn();
    mockAddressDelete.mockResolvedValue({} as any);

    await deleteAddressAction("addr_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/addresses");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/checkout");
  });

  it("devuelve error si Prisma lanza", async () => {
    asLoggedIn();
    mockAddressDelete.mockRejectedValue(new Error("DB error"));

    const result = await deleteAddressAction("addr_1");
    expect(result).toEqual({ error: "Error al eliminar la dirección." });
  });
});

// ─── setDefaultAddressAction ──────────────────────────────────────────────────
describe("setDefaultAddressAction", () => {
  it("devuelve error si no hay sesión", async () => {
    asGuest();

    const result = await setDefaultAddressAction("addr_1");
    expect(result).toEqual({ error: "No autorizado" });
  });

  it("ejecuta $transaction con array de dos operaciones", async () => {
    asLoggedIn();
    mockTransaction.mockResolvedValue([] as any);

    const result = await setDefaultAddressAction("addr_1");

    expect(result).toEqual({ success: true });
    expect(mockTransaction).toHaveBeenCalledWith(
      expect.arrayContaining([undefined, undefined]),
    );
  });

  it("llama a revalidatePath tras actualizar", async () => {
    asLoggedIn();
    mockTransaction.mockResolvedValue([] as any);

    await setDefaultAddressAction("addr_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/addresses");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/checkout");
  });

  it("devuelve error si $transaction lanza", async () => {
    asLoggedIn();
    mockTransaction.mockRejectedValue(new Error("DB error"));

    const result = await setDefaultAddressAction("addr_1");
    expect(result).toEqual({
      error: "Error al cambiar la dirección principal.",
    });
  });
});
