import React from "react";
import Invoice from "../../components/Invoice/Invoice";

const InvoiceModal = ({
  isOpen,
  setIsOpen,
  transaction,
  setTransaction,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: any;
  setTransaction: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const handleClose = () => {
    setIsOpen(false);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={stopPropagation}
      >
        <Invoice
          transaction={transaction}
          setTransaction={setTransaction}
          handleClose={handleClose}
        />
      </div>
    </div>
  );
};

export default InvoiceModal;
