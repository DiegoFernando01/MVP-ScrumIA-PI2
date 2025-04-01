import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionForm from "../components/wallet/TransactionForm"; // Ruta real del componente

describe("TransactionForm", () => {
  it("debe llamar a handleSubmit al hacer clic en el botón Agregar", () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());

    render(
      <TransactionForm
        formData={{
          amount: "100",
          type: "income",
          date: "2024-03-26",
          description: "Test",
          category: "Salario"
        }}
        handleSubmit={handleSubmit}
        handleChange={jest.fn()}
        handleClear={jest.fn()}
        errors={{}}
        categories={{ income: ["Salario"], expense: [] }}
        newCategoryInput=""
        setNewCategoryInput={jest.fn()}
        showNewCategoryInput={false}
        setShowNewCategoryInput={jest.fn()}
        addNewCategory={jest.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /agregar/i });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalled();
  });
});
