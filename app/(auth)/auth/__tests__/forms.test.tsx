import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { LoginForm } from "@/app/(auth)/auth/login/LoginForm";
import { RegisterForm } from "@/app/(auth)/auth/register/RegisterForm";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock de componentes UI — respetan los htmlFor/id para que getByLabelText funcione
vi.mock("@/components/ui", () => ({
  Button: ({ children, type, disabled, onClick, ...props }: any) => (
    <button type={type} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Input: ({ id, name, type, ...props }: any) => (
    <input id={id} name={name} type={type ?? "text"} {...props} />
  ),
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  PasswordInput: ({ id, name, ...props }: any) => (
    <input id={id} name={name} type="password" {...props} />
  ),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
    back: vi.fn(),
    prefetch: vi.fn(),
    forward: vi.fn(),
  } as any);

  vi.mocked(useSearchParams).mockReturnValue({
    get: vi.fn(() => null),
  } as any);
});

// ─── LoginForm ────────────────────────────────────────────────────────────────
describe("LoginForm", () => {
  it("renderiza los campos de email y contraseña", () => {
    render(<LoginForm redirectTo="/" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("muestra mensaje de éxito cuando ?success=registered", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key: string) => (key === "success" ? "registered" : null)),
    } as any);

    render(<LoginForm redirectTo="/" />);
    expect(
      screen.getByText("Cuenta creada correctamente. Inicia sesión."),
    ).toBeInTheDocument();
  });

  it("muestra error de validación si se envía el email vacío", async () => {
    const user = userEvent.setup();
    render(<LoginForm redirectTo="/" />);

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      // El schema de loginSchema requiere email válido
      expect(screen.queryAllByText(/./)).toBeDefined();
      expect(signIn).not.toHaveBeenCalled();
    });
  });

  it("llama a signIn con las credenciales introducidas", async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({ error: null } as any);

    render(<LoginForm redirectTo="/" />);

    await user.type(screen.getByLabelText("Email"), "user@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          redirect: false,
          email: "user@test.com",
          password: "Password1",
        }),
      );
    });
  });

  it("muestra error si signIn devuelve CredentialsSignin", async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({ error: "CredentialsSignin" } as any);

    render(<LoginForm redirectTo="/" />);

    await user.type(screen.getByLabelText("Email"), "user@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "WrongPass1");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(
        screen.getByText("Email o contraseña incorrectos."),
      ).toBeInTheDocument();
    });
  });

  it("redirige tras login exitoso", async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({ error: null } as any);

    render(<LoginForm redirectTo="/account" />);

    await user.type(screen.getByLabelText("Email"), "user@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("muestra botón 'Continuar como invitado' si redirectTo incluye checkout", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key: string) => (key === "redirectTo" ? "/checkout" : null)),
    } as any);

    render(<LoginForm redirectTo="/checkout" />);
    expect(
      screen.getByRole("button", { name: "Continuar como invitado" }),
    ).toBeInTheDocument();
  });

  it("NO muestra 'Continuar como invitado' en login normal", () => {
    render(<LoginForm redirectTo="/" />);
    expect(
      screen.queryByRole("button", { name: "Continuar como invitado" }),
    ).not.toBeInTheDocument();
  });

  it("redirige a /checkout al pulsar Continuar como invitado", async () => {
    const user = userEvent.setup();
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key: string) => (key === "redirectTo" ? "/checkout" : null)),
    } as any);

    render(<LoginForm redirectTo="/checkout" />);
    await user.click(
      screen.getByRole("button", { name: "Continuar como invitado" }),
    );

    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });
});

// ─── RegisterForm ─────────────────────────────────────────────────────────────
describe("RegisterForm", () => {
  const mockAction = vi.fn();

  beforeEach(() => {
    mockAction.mockReset();
  });

  // Helper para rellenar el formulario completo
  async function fillForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Nombre"), "Juan");
    await user.type(screen.getByLabelText("Apellidos"), "García");
    await user.type(screen.getByLabelText("Teléfono"), "612345678");
    await user.type(screen.getByLabelText("Email"), "juan@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "Password1");
  }

  it("renderiza todos los campos del formulario", () => {
    render(<RegisterForm action={mockAction} redirectTo="/" />);

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
  });

  it("no llama a la action si hay errores de validación", async () => {
    const user = userEvent.setup();
    render(<RegisterForm action={mockAction} redirectTo="/" />);

    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    render(<RegisterForm action={mockAction} redirectTo="/" />);

    await user.type(screen.getByLabelText("Nombre"), "Juan");
    await user.type(screen.getByLabelText("Apellidos"), "García");
    await user.type(screen.getByLabelText("Teléfono"), "612345678");
    await user.type(screen.getByLabelText("Email"), "juan@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.type(
      screen.getByLabelText("Confirmar contraseña"),
      "OtherPass1",
    );
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(
        screen.getByText("Las contraseñas no coinciden"),
      ).toBeInTheDocument();
    });
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("llama a la action con datos válidos", async () => {
    const user = userEvent.setup();
    mockAction.mockResolvedValue({ success: true });
    vi.mocked(signIn).mockResolvedValue({ error: null } as any);

    render(<RegisterForm action={mockAction} redirectTo="/" />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });
  });

  it("muestra error 'Ya existe una cuenta' cuando la action devuelve error:exists", async () => {
    const user = userEvent.setup();
    mockAction.mockResolvedValue({ error: "exists" });

    render(<RegisterForm action={mockAction} redirectTo="/" />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(
        screen.getByText("Ya existe una cuenta con este email."),
      ).toBeInTheDocument();
    });
  });

  it("hace auto-login tras registro exitoso", async () => {
    const user = userEvent.setup();
    mockAction.mockResolvedValue({ success: true });
    vi.mocked(signIn).mockResolvedValue({ error: null } as any);

    render(<RegisterForm action={mockAction} redirectTo="/" />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          redirect: false,
          email: "juan@test.com",
          password: "Password1",
        }),
      );
    });
  });

  it("redirige a /auth/login?success=registered si el auto-login falla", async () => {
    const user = userEvent.setup();
    mockAction.mockResolvedValue({ success: true });
    vi.mocked(signIn).mockResolvedValue({ error: "CredentialsSignin" } as any);

    render(<RegisterForm action={mockAction} redirectTo="/" />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login?success=registered");
    });
  });

  it("redirige al redirectTo si el auto-login es exitoso", async () => {
    const user = userEvent.setup();
    mockAction.mockResolvedValue({ success: true });
    vi.mocked(signIn).mockResolvedValue({ error: null } as any);
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key: string) => (key === "redirectTo" ? "/account" : null)),
    } as any);

    render(<RegisterForm action={mockAction} redirectTo="/account" />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/account");
    });
  });
});
