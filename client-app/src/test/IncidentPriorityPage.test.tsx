import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import IncidentPriorityPage from "@/pages/IncidentPriorityPage";
import * as incidentApi from "@/api/incident";
import { useToast } from "@/components/toast/ToastProvider";

vi.mock("@/components/toast/ToastProvider", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/api/incident", () => ({
  getIncidentById: vi.fn(),
  updateIncident: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("IncidentPriorityPage", () => {
  const mockShowError = vi.fn();
  const mockShowSuccess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useToast as any).mockReturnValue({
      showError: mockShowError,
      showSuccess: mockShowSuccess,
    });
  });

  const renderPage = async (incidentData: any) => {
    (incidentApi.getIncidentById as any).mockResolvedValue(incidentData);
    render(
      <MemoryRouter initialEntries={["/incidents/123/prioritize"]}>
        <Routes>
          <Route
            path="/incidents/:incidentId/prioritize"
            element={<IncidentPriorityPage />}
          />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(incidentApi.getIncidentById).toHaveBeenCalledWith(123)
    );
  };

  it("submits valid updates successfully", async () => {
    const mockIncident = {
      incidentId: 123,
      title: "Flood alert",
      description: "Water level rising",
      severity: "High",
      gripLevel: 2,
    };

    await renderPage(mockIncident);

    fireEvent.change(screen.getByLabelText("Severity"), {
      target: { value: "Critical" },
    });
    fireEvent.change(screen.getByLabelText("GRIP level"), {
      target: { value: 4 },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(incidentApi.updateIncident).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          severity: "Critical",
          gripLevel: 4,
        })
      )
    );

    expect(mockShowSuccess).toHaveBeenCalledWith("Incident updated");
  });

  it("shows error toast when grip level is invalid", async () => {
    const mockIncident = {
      incidentId: 123,
      title: "Power outage",
      description: "Transformer issue",
      severity: "Low",
      gripLevel: 9, // 👈 از اول نامعتبر
    };

    await renderPage(mockIncident);

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith(
        "GRIP level must be between 0 and 5"
      )
    );

    expect(incidentApi.updateIncident).not.toHaveBeenCalled();
  });
});
