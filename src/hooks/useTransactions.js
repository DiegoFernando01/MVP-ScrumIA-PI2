import { useState, useEffect } from "react";
import { auth } from "../services/firebaseConfig";
import {
  saveTransaction, 
  getUserTransactions,
  deleteTransaction as deleteTransactionService, 
  updateTransaction,
} from "../services/transactionService";

/**
 * Hook personalizado para manejar transacciones en Firebase
 */
const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const res = await getUserTransactions(user.uid);
      if (res.success) {
        setTransactions(res.transactions);
      }
      setLoading(false);
    };

    fetchUserTransactions();
  }, []);

  const createTransaction = async (data) => { // Asegúrate de usar saveTransaction
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Usuario no autenticado" };

    const newTransaction = {
      ...data,
      id: data.id || `tx-${Date.now()}`,
    };

    const res = await saveTransaction(user.uid, newTransaction); // Cambié a saveTransaction
    if (res.success) {
      setTransactions((prev) => [...prev, newTransaction]);
    }
    return res;
  };

  const editTransaction = async (id, updatedData) => {
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, error: "No encontrada" };

    const updatedTransaction = {
      ...transactions[index],
      ...updatedData,
    };

    const res = await updateTransaction(id, updatedTransaction);
    if (res.success) {
      const updatedList = [...transactions];
      updatedList[index] = updatedTransaction;
      setTransactions(updatedList);
    }

    return res;
  };

  const deleteTransaction = async (id) => {
    const res = await deleteTransactionService(id);
    if (res.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    return res;
  };

  return {
    transactions,
    loading,
    createTransaction, 
    editTransaction,
    deleteTransaction,
  };
};

export default useTransactions;
