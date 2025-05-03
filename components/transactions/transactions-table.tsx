"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  TruckIcon,
  RotateCcw,
  ArrowRightLeft,
  DollarSign,
  Edit,
  Delete,
  DeleteIcon,
  Trash,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  limit,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import EditReturnModal from "@/app/modals/edit-return-modal";
import EditTripModal from "@/app/modals/edit-trip-modal";
import InvoiceModal from "@/app/modals/invoiceModal";
import { useConfirmModal } from "@/hooks/useConfirmModal";
type Transaction = {
  id: string;
  type: "departure" | "return" | "sale";
  reference: string;
  date: Timestamp;
  items: number;
  value: number;
  totalSellPrice: number;
  vehicle: {
    id: string;
    name: string;
  };
  status: string;
};

interface TransactionsTableProps {
  type: "all" | "departure" | "return" | "sale";
  limitCount?: number;
  finishedAdding?: number;
  setFinishedAdding: React.Dispatch<React.SetStateAction<number>>;
  searchQ?: string;
}

export default function TransactionsTable({
  type,
  limitCount = 100,
  finishedAdding,
  setFinishedAdding,
  searchQ,
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReturnModalOpen, setEditReturnModalOpen] = useState(false);
  const [editTripModalOpen, setEditTripModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");

  const [modalInvoicOpen, setModalInvoicOpen] = useState(false);
  const [invoiceSelected, setInvoiceSelected] = useState<Transaction | null>(
    null
  );
  const [searchRes, setSearchRes] = useState([] as Transaction[]);
  const { showModal } = useConfirmModal();

  const dataToDisplay =
    searchQ && searchQ.length > 0 ? searchRes : transactions;
  useEffect(() => {
    fetchTransactions();
  }, [type]);
  useEffect(() => {
    if (finishedAdding) {
      fetchTransactions();
    }
  }, [finishedAdding]);

  useEffect(() => {
    if (searchQ) {
      const filteredTransactions = transactions.filter((transaction) => {
        const searchQuery = searchQ.toLowerCase();
        const formattedDate = formatDate(transaction.date).toLowerCase();
        const formattedValue = formatCurrency(transaction.value).toLowerCase();
        const formattedTotalSellPrice = transaction.totalSellPrice
          ? formatCurrency(transaction.totalSellPrice).toLowerCase()
          : "";

        // Convert the search query to a date if it matches the format "dd-mm-yyyy"
        const isDateQuery = /^\d{2}-\d{2}-\d{4}$/.test(searchQuery);
        const dateQuery = isDateQuery ? searchQuery : null;

        return (
          transaction.reference.toLowerCase().includes(searchQuery) ||
          transaction.type.toLowerCase().includes(searchQuery) ||
          transaction.vehicle.name.toLowerCase().includes(searchQuery) ||
          transaction.status.toLowerCase().includes(searchQuery) ||
          formattedDate.includes(searchQuery) ||
          (dateQuery && formattedDate === dateQuery) ||
          formattedValue.includes(searchQuery) ||
          formattedTotalSellPrice.includes(searchQuery)
        );
      });
      setSearchRes(filteredTransactions);
    } else {
      fetchTransactions();
    }
  }, [searchQ]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionsCollection = collection(db, "transactions");

      // Build query based on type
      let q = query(
        transactionsCollection,
        orderBy("date", "desc")
        // limit(limitCount)
      );

      if (type !== "all") {
        q = query(
          transactionsCollection,
          where("type", "==", type),
          orderBy("date", "desc")
          // limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);

      const transactionsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          data: data,
          id: doc.id,
          type: data.type,
          reference: data.reference,
          date: data.date,
          items: data.items,
          value: data.value,
          totalSellPrice: data.totalSellPrice,
          vehicle: {
            id: data.vehicleId || "",
            name: data.vehicleName || "Unknown",
          },
          status: data.status || "unknown",
        };
      });

      setTransactions(transactionsList);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (
    id: string,
    transactionType: "departure" | "return" | "sale"
  ) => {
    setSelectedTransactionId(id);
    if (transactionType === "return") {
      setEditReturnModalOpen(true);
    } else if (transactionType === "departure") {
      setEditTripModalOpen(true);
    }
  };

  const closeEditReturnModal = () => {
    setEditReturnModalOpen(false);
    setSelectedTransactionId("");
    // Refresh the transactions after editing

    fetchTransactions();
  };

  const closeEditTripModal = () => {
    setEditTripModalOpen(false);
    setSelectedTransactionId("");
    // Refresh the transactions after editing
    fetchTransactions();
  };

  const getTypeBadge = (transactionType: Transaction["type"]) => {
    switch (transactionType) {
      case "departure":
        return <Badge className="bg-blue-500">Departure</Badge>;
      case "return":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Return
          </Badge>
        );
      case "sale":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Sale
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (transactionType: Transaction["type"]) => {
    switch (transactionType) {
      case "departure":
        return <TruckIcon className="h-4 w-4 text-blue-500" />;
      case "return":
        return <RotateCcw className="h-4 w-4 text-purple-500" />;
      case "sale":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Open
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Completed
          </Badge>
        );
      case "reconciled":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Reconciled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        Loading...
      </div>
    );
  }

  if (dataToDisplay.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        No transactions found
      </div>
    );
  }

  const handleInvoiceClick = (transaction: Transaction) => {
    setInvoiceSelected(transaction);
    setModalInvoicOpen(true);
  };
  const deleteTransaction = async (id: string) => {
    try {
      showModal(
        async () => {
          const transactionRef = collection(db, "transactions");
          const transactionDoc = query(
            transactionRef,
            where("__name__", "==", id)
          );
          const snapshot = await getDocs(transactionDoc);

          if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await deleteDoc(snapshot.docs[0].ref);
            setFinishedAdding((prev) => prev + 1);
          } else {
            console.log("Transaction not found with ID:", id);
          }
        },
        () => {}
      );
    } catch (error) {
      console.log("Error deleting transaction:", error);
    }
  };

  return (
    <>
      {modalInvoicOpen && (
        <InvoiceModal
          isOpen={modalInvoicOpen}
          setIsOpen={setModalInvoicOpen}
          transaction={invoiceSelected}
          setTransaction={setInvoiceSelected}
        />
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Value</TableHead>
              {/* sales value */}
              <TableHead>Sales value</TableHead>

              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataToDisplay?.map((transaction) => {
              return (
                <TableRow
                  key={transaction.id}
                  className={
                    transaction.type === "return"
                      ? "bg-purple-50/30"
                      : transaction.type === "sale"
                      ? "bg-emerald-50/30"
                      : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      {getTypeBadge(transaction.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.items} items</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.value)}
                  </TableCell>
                  <TableCell>
                    {transaction.type === "return"
                      ? "--"
                      : transaction.totalSellPrice != null
                      ? formatCurrency(transaction.totalSellPrice)
                      : "--"}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TruckIcon className="h-4 w-4 text-muted-foreground" />
                      {transaction.vehicle.name}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem>View details</DropdownMenuItem> */}

                        {/* {transaction.type === "departure" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleEditTransaction(
                              transaction.id,
                              transaction.type
                            )
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit {transaction.type}
                        </DropdownMenuItem>
                      )} */}

                        {/* {transaction.type === "departure" &&
                        transaction.status === "open" && (
                          <DropdownMenuItem data-modal-trigger="record-return">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Record Return
                          </DropdownMenuItem>
                        )} */}

                        {transaction.type === "sale" && (
                          //invoice
                          <DropdownMenuItem
                            onClick={() => handleInvoiceClick(transaction)}
                          >
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Invoice
                          </DropdownMenuItem>
                        )}
                        {/* dlete */}
                        <DropdownMenuItem
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete {transaction.type}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Return Modal */}
      {editReturnModalOpen && (
        <EditReturnModal
          isOpen={editReturnModalOpen}
          onClose={closeEditReturnModal}
          returnId={selectedTransactionId}
        />
      )}

      {/* Edit Trip Modal */}
      {editTripModalOpen && (
        <EditTripModal
          isOpen={editTripModalOpen}
          onClose={closeEditTripModal}
          tripId={selectedTransactionId}
        />
      )}
    </>
  );
}
