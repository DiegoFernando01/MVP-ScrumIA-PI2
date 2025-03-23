import React, { useState } from "react";

function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "income",
    date: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "El monto debe ser un número mayor a cero.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = "La fecha debe tener el formato YYYY-MM-DD.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setTransactions([...transactions, { ...formData, id: Date.now() }]);
    setFormData({
      amount: "",
      type: "income",
      date: "",
      description: "",
      category: "",
    });
    setErrors({});
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-center mb-4">
        Agregar Transacción
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        <div>
          <label className="block mb-1 text-sm font-medium">Monto *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
            placeholder="Ej: 100.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-xs">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Tipo *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Fecha *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Descripción</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
            placeholder="Ej: Compra supermercado"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Categoría</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
            placeholder="Ej: Alimentos, Transporte"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Agregar
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Transacciones</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Aún no hay transacciones registradas.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li
                key={t.id}
                className={`p-3 rounded shadow text-sm ${
                  t.type === "income" ? "bg-green-300" : "bg-red-300"
                }`}
              >
                <div className="flex justify-between text-black">
                  <span>{t.description || "Sin descripción"}</span>
                  <span className="font-semibold">
                    {t.type === "income" ? "+" : "-"}$
                    {parseFloat(t.amount).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {t.date} • {t.category || "Sin categoría"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Wallet;
